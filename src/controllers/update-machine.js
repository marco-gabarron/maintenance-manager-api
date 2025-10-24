import { UpdateMachineUseCase } from '../use-cases/update-machine.js'

export class UpdateMachineController {
    async execute(httpRequest) {
        try {
            const params = httpRequest.body
            const machineId = httpRequest.params.machineId
            //Validate inputs(Mandatory fields, email format, password strength)
            // const allowedFields = [
            //     'area_id',
            //     'machine_type',
            //     'model',
            //     'plant',
            //     'manufacturer',
            //     'year',
            //     'serial_number',
            //     'service_frequency',
            //     'status',
            // ]

            // const someFieldsIsNotAllowed = Object.keys(params).some(
            //     (field) => !allowedFields.includes(field),
            // )

            // if (someFieldsIsNotAllowed) {
            //     return {
            //         statusCode: 400,
            //         body: `Some provided field is not allowed.`,
            //     }
            // }

            //Call use case to create user when inputs are valid
            const updatedMachineUseCase = new UpdateMachineUseCase()

            const updatedMachine = await updatedMachineUseCase.execute(
                machineId,
                params,
            )

            return {
                statusCode: 200,
                body: updatedMachine,
            }

            //Return response to user(status code)
        } catch (error) {
            console.error('Error in UpdateMachineController:', error)
            return {
                statusCode: 500,
                body: 'Internal server error',
            }
        }
    }
}
