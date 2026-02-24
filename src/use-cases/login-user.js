export class LoginUserUseCase {
    constructor(
        getUserByEmail,
        passwordComparatorAdapter,
        tokensGeneratorAdapter,
    ) {
        this.getUserByEmail = getUserByEmail
        this.passwordComparatorAdapter = passwordComparatorAdapter
        this.tokensGeneratorAdapter = tokensGeneratorAdapter
    }
    async execute(params) {
        // check if email exists and password is correct
        const user = await this.getUserByEmail.execute(params.email)

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isPasswordValid = await this.passwordComparatorAdapter.execute(
            params.password,
            user.password,
        )

        if (!isPasswordValid) {
            throw new Error('Invalid credentials')
        }

        return {
            ...user,
            tokens: this.tokensGeneratorAdapter.execute(user.id),
        }
    }
}
