import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest'
import { InMemorCheckInsRepository } from '../repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymsRepository } from '../repositories/in-memory/in-memory-gyms-repositori'
import { string } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

let checkInsRepository: InMemorCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemorCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    gymsRepository.items.push({
      id: 'gym-01',
      title: 'Hacker Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-22.8537607),
      longitude: new Decimal(-43.491542),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatirude: -22.8537607,
      userLongitude: -43.491542,
    })
    await expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2023, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatirude: -22.8537607,
      userLongitude: -43.491542,
    })
    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatirude: -22.8537607,
        userLongitude: -43.491542,
      }),
    ).rejects.toBeInstanceOf(Error)

    it('should be able to check in twice but in different days', async () => {
      vi.setSystemTime(new Date(23, 0, 20, 8, 0, 0))

      await sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatirude: 0,
        userLongitude: 0,
      })
      vi.setSystemTime(new Date(23, 0, 21, 8, 0, 0))

      const { checkIn } = await sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatirude: 0,
        userLongitude: 0,
      })

      expect(checkIn.id).toEqual(expect.any(string))
    })

    it('should not be  able to  check in on distant gym', async () => {
      gymsRepository.items.push({
        id: 'gym-02',
        title: 'Python Gym',
        description: '',
        phone: '',
        latitude: new Decimal(-22.8415703),
        longitude: new Decimal(-43.4613199),
      })

      await expect(() =>
        sut.execute({
          gymId: 'gym-01',
          userId: 'user-01',
          userLatirude: -22.8537607,
          userLongitude: -43.491542,
        }),
      ).rejects.toBeInstanceOf(Error)
    })
  })
})
