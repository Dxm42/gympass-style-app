import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '../repositories/check-in-repository'
import { GymRepository } from '../repositories/gyms-repository'
import { ResourceNotFoundError } from '../use-cases/errors/resource-not-found-error'
import { getDistanceBetweenCoordinates } from '../utils/get-istance-between-corrdinates'

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatirude: number
  userLongitude: number
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn
}

export class CheckInUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymRepository,
  ) {}

  async execute({
    userId,
    gymId,
    userLatirude,
    userLongitude,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)

    if (!gym) {
      throw new ResourceNotFoundError()
    }

    // calculardistancia da  academia

    const distance = getDistanceBetweenCoordinates(
      {
        latitude: userLatirude,
        longitude: userLongitude,
      },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    )
    const MAX_DISTANC_IN_KILOMETERS = 0.1

    if (distance > MAX_DISTANC_IN_KILOMETERS) {
      throw new Error()
    }

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdOndate(
      userId,
      new Date(),
    )

    if (checkInOnSameDay) {
      throw new Error()
    }
    const checkIn = await this.checkInsRepository.create({
      gym_id: gymId,
      user_id: userId,
    })
    return {
      checkIn,
    }
  }
}
