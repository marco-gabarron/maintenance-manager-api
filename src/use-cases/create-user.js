import { v4 as uuidv4 } from 'uuid'
// import bcrypt from 'bcrypt'
import { PostgresCreateUserRepository } from '../repositories/postgres/create-user.js'

export class CreateUserUseCase {
    async execute(createUserParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //Generate unique ID
        const id = uuidv4()
        const areaId = parseInt(createUserParams.area_id)

        //criptograph password, useful when auth is implemented
        // const hashedPassword = await bcrypt.hash(createUserParams.password, 10)

        //store user in database
        const machine = {
            ...createUserParams,
            ID: id,
            area_id: areaId,
            // password: hashedPassword,
        }

        // Use repository to create user
        const postgresCreateUserRepository = new PostgresCreateUserRepository()
        const createdMachine =
            await postgresCreateUserRepository.execute(machine)
        return createdMachine
    }
}
