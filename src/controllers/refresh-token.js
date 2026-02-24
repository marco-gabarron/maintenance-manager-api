export class RefreshTokenController {
    constructor(refreshTokenUseCase) {
        this.refreshTokenUseCase = refreshTokenUseCase
    }
    execute(httpRequest) {
        try {
            const result = this.refreshTokenUseCase.execute(
                httpRequest.body.refreshToken,
            )
            return {
                statusCode: 200,
                body: result,
            }
        } catch (error) {
            return {
                statusCode: 400,
                body: error.message,
            }
        }
    }
}
