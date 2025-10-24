// import bcrypt from 'bcrypt'
import { PostgresUpdateHistoryRepository } from '../repositories/postgres/update-history.js'

export class UpdateHistoryUseCase {
    async execute(historyId, UpdateHistoryParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //criptograph password, useful when auth is implemented
        // const hashedPassword = await bcrypt.hash(createUserParams.password, 10)

        //store user in database
        const history = {
            ...UpdateHistoryParams,
            // password: hashedPassword,
        }

        // Use repository to create user
        const postgresUpdateHistoryRepository =
            new PostgresUpdateHistoryRepository()
        const updatedHistory = await postgresUpdateHistoryRepository.execute(
            historyId,
            history,
        )
        return updatedHistory
    }
}
