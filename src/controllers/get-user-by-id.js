import validator from 'validator'

export class GetUserByIdController {
    async execute(user) {
        try {
            const isIdValid = validator.isUUID(user.id)

            if (!isIdValid) {
                return {
                    statusCode: 404,
                    body: 'User Id is not valid',
                }
            }

            if (!user) {
                return {
                    statusCode: 404,
                    body: 'User not found',
                }
            }

            return {
                statusCode: 200,
                body: user,
            }
        } catch (error) {
            console.error(error)
            return {
                statusCode: 500,
                body: 'Server Error',
            }
        }
    }
}
