import { CreateHistoryUseCase } from '../use-cases/create-history.js'

export class CreateHistoryController {
    async execute(httpRequest) {
        try {
            const body = httpRequest.body || {}
            const params = body.params
                ? { ...body, ...body.params }
                : { ...body }

            // params.file = params.file || httpRequest.file || null
            // params.imageBase64 = params.imageBase64 || params.image || null
            // params.file_service_report =
            //     params.file_service_report || params.fileServiceReport || null

            // if (
            //     !params.file &&
            //     !params.imageBase64 &&
            //     !params.file_service_report
            // ) {
            //     throw new Error('Image required!')
            // }

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

            // console.log('=========', params)
            // console.log('================================', httpRequest.files)

            params.files = httpRequest.files
            // Call use case to create user when inputs are valid
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
