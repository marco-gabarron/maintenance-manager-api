import { v4 as uuidv4 } from 'uuid'
// import bcrypt from 'bcrypt'
import { PostgresCreateHistoryRepository } from '../repositories/postgres/create-history.js'

export class CreateHistoryUseCase {
    async execute(createHistoryParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //Generate unique ID
        const id = uuidv4()

        //criptograph password, useful when auth is implemented
        // const hashedPassword = await bcrypt.hash(createUserParams.password, 10)

        //store user in database
        const history = {
            ...createHistoryParams,
            ID: id,
            // password: hashedPassword,
        }

        // Use repository to create user
        const postgresCreateHistoryRepository =
            new PostgresCreateHistoryRepository()
        const createdHistory =
            await postgresCreateHistoryRepository.execute(history)
        return createdHistory
    }
}
