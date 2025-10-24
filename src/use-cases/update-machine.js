// import bcrypt from 'bcrypt'
import { PostgresUpdateMachineRepository } from '../repositories/postgres/update-machine.js'

export class UpdateMachineUseCase {
    async execute(machineId, UpdateMachineParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //criptograph password, useful when auth is implemented
        // const hashedPassword = await bcrypt.hash(createUserParams.password, 10)

        //store user in database
        const machine = {
            ...UpdateMachineParams,
            // password: hashedPassword,
        }

        // Use repository to create user
        const postgresUpdateMachineRepository =
            new PostgresUpdateMachineRepository()
        const updatedMachine = await postgresUpdateMachineRepository.execute(
            machineId,
            machine,
        )
        return updatedMachine
    }
}
