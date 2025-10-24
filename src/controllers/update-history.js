import { UpdateHistoryUseCase } from '../use-cases/update-history.js'

export class UpdateHistoryController {
    async execute(httpRequest) {
        try {
            const params = httpRequest.body
            const historyId = httpRequest.params.historyId
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
            const updatedHistoryUseCase = new UpdateHistoryUseCase()

            const updatedHistory = await updatedHistoryUseCase.execute(
                historyId,
                params,
            )

            return {
                statusCode: 200,
                body: updatedHistory,
            }

            //Return response to user(status code)
        } catch (error) {
            console.error('Error in UpdateHistoryController:', error)
            return {
                statusCode: 500,
                body: 'Internal server error',
            }
        }
    }
}
