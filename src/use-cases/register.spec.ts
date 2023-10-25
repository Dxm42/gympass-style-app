import { expect, describe, it } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExixtsError } from './errors/user-alredy-exists'

describe('Register Use Case', () => {
  it('should be able to register', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)

    const { user } = await registerUseCase.execute({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })
  it('should hash user password upon registration', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)

    const { user } = await registerUseCase.execute({
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
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)

    const email = 'johndoe@example.com'

    await registerUseCase.execute({
      name: 'John doe',
      email,
      password: '123456',
    })

    expect(async () => {
      await registerUseCase.execute({
        name: 'John doe',
        email,
        password: '123456',
      })
    }).rejects.toBeInstanceOf(UserAlreadyExixtsError)
  })
})
