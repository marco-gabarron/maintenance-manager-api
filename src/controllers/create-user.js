import { CreateUserUseCase } from '../use-cases/create-user.js'

export class CreateUserController {
    async execute(httpRequest) {
        try {
            const params = httpRequest.body
            //Validate inputs(Mandatory fields, email format, password strength)
            const requiredFields = [
                'area_id',
                'model',
                'plant',
                'manufacturer',
                'year',
                'serial_number',
                'service_frequency',
                'hours',
                'mileage',
                'status',
            ]

            for (const field of requiredFields) {
                if (!params[field]) {
                    return {
                        statusCode: 400,
                        body: `Missing required field: ${field}`,
                    }
                }
            }

            //Call use case to create user when inputs are valid
            const createdMachineUseCase = new CreateUserUseCase()

            const createdMachine = await createdMachineUseCase.execute(params)

            return {
                statusCode: 200,
                body: createdMachine,
            }

            //Return response to user(status code)
        } catch (error) {
            console.error('Error in CreateUserController:', error)
            return {
                statusCode: 500,
                body: 'Internal server error',
            }
        }
    }
}
