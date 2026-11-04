import { CreateChecklistUseCase } from '../use-cases/create-checklist.js'

export class CreateChecklistController {
    async execute(httpRequest) {
        try {
            const params = httpRequest.body

            // Call use case to create user when inputs are valid
            const createdChecklistUseCase = new CreateChecklistUseCase()

            const createdChecklist =
                await createdChecklistUseCase.execute(params)

            return {
                statusCode: 200,
                body: createdChecklist,
            }

            //Return response to user(status code)
        } catch (error) {
            console.error('Error in CreateChecklistController:', error)
            return {
                statusCode: 500,
                body: 'Internal server error',
            }
        }
    }
}
