import { v4 as uuidv4 } from 'uuid'
// import bcrypt from 'bcrypt'
import { PostgresCreateChecklistRepository } from '../repositories/postgres/create-checklist.js'

export class CreateChecklistUseCase {
    async execute(createChecklistParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //Generate unique ID
        const id = uuidv4()

        //criptograph password, useful when auth is implemented
        // const hashedPassword = await bcrypt.hash(createChecklistParams.password, 10)

        //store user in database
        const checklist = {
            ...createChecklistParams,
            id: id,
            // password: hashedPassword,
        }

        // Use repository to create user
        const postgresCreateChecklistRepository =
            new PostgresCreateChecklistRepository()
        const createdChecklist =
            await postgresCreateChecklistRepository.execute(checklist)
        return createdChecklist
    }
}
