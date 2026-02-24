export class RefreshTokenUseCase {
    constructor(tokensGeneratorAdapter, tokenVerifierAdapter) {
        this.tokensGeneratorAdapter = tokensGeneratorAdapter
        this.tokenVerifierAdapter = tokenVerifierAdapter
    }
    execute(refreshToken) {
        try {
            const decoded = this.tokenVerifierAdapter.execute(
                refreshToken,
                process.env.JWT_REFRESH_TOKEN_SECRET,
            )
            if (!decoded) {
                throw new Error('Invalid refresh token')
            }
            return this.tokensGeneratorAdapter.execute(decoded.userId)
        } catch (error) {
            console.error(error)
            throw new Error('Invalid refresh token')
        }
    }
}
