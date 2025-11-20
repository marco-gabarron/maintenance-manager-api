import { CreateHistoryUseCase } from '../use-cases/create-history.js'

export class CreateHistoryController {
    async execute(httpRequest) {
        try {
            const params = httpRequest.body
            //Validate inputs(Mandatory fields, email format, password strength)
            const requiredFields = [
                'machine_id',
                'date',
                'service_level',
                'description',
                'service_type',
                'completed_by',
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
            const createdHistoryUseCase = new CreateHistoryUseCase()

            const createdHistory = await createdHistoryUseCase.execute(params)

            return {
                statusCode: 200,
                body: createdHistory,
            }

            //Return response to user(status code)
        } catch (error) {
            console.error('Error in CreateHistoryController:', error)
            return {
                statusCode: 500,
                body: 'Internal server error',
            }
        }
    }
}
