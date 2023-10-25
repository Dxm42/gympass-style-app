export class UserAlreadyExixtsError extends Error {
  constructor() {
    super('E-mail already exixts.')
  }
}
