export class LoginUserUseCase {
    async execute(params) {
        //Implement login logic here (e.g., verify credentials, generate token)
        //This is a placeholder implementation and should be replaced with actual logic
        if (
            params.email === 'dkelly@hanlonconcrete.ie' &&
            params.password === '123456'
        ) {
            return { token: 'fake-jwt-token' }
        } else {
            throw new Error('Invalid credentials')
        }
    }
}
