import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExixtsError } from './errors/user-alredy-exists'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })
  it('should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })
  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123456',
    })
    const isPasswordCorrectlyhashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyhashed).toBe(true)
  })

  it('should not be albe register with same email twice', async () => {
    const email = 'johndoe@example.com'

    await sut.execute({
      name: 'John doe',
      email,
      password: '123456',
    })

    expect(async () => {
      await sut.execute({
        name: 'John doe',
        email,
        password: '123456',
      })
    }).rejects.toBeInstanceOf(UserAlreadyExixtsError)
  })
})
