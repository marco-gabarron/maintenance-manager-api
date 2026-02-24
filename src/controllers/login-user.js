export class LoginUserController {
    constructor(loginUserUseCase) {
        this.loginUserUseCase = loginUserUseCase
    }
    async execute(httpRequest) {
        try {
            const params = httpRequest.body
            const user = await this.loginUserUseCase.execute({
                email: params.email,
                password: params.password,
            })
            return {
                statusCode: 200,
                body: user,
            }
        } catch (error) {
            return {
                statusCode: 401,
                body: { error: error.message },
            }
        }
    }
}
