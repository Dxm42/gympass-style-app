import { randomUUID } from 'node:crypto'
import { CheckInsRepository } from '../check-in-repository'
import { Prisma, CheckIn } from '@prisma/client'
import dayjs from 'dayjs'

export class InMemorCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async findByUserIdOndate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOftheDay = dayjs(date).endOf('date')

    const checkInOnDate = this.items.find((checkIn) => {
      const checkInDate = dayjs(checkIn.created_at)
      const isOnSamedate =
        checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOftheDay)

      return checkIn.user_id === userId && isOnSamedate
    })

    if (!checkInOnDate) {
      return null
    }

    return checkInOnDate
  }

  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      created_at: new Date(),
    }

    this.items.push(checkIn)
    return checkIn
  }
}
