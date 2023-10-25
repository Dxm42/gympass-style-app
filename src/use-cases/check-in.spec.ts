import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemorCheckInssRepository } from '../repositories/in-memory/in-memory-check-ins-repository'
import { UserAlreadyExixtsError } from './errors/user-alredy-exists'
import { CheckInUseCase } from './check-in'
import { string } from 'zod'

let checkInsRepository: InMemorCheckInssRepository
let sut: CheckInUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemorCheckInssRepository()
    sut = new CheckInUseCase(checkInsRepository)
  })
  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
})
