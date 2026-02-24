import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
    if (req.path === '/login' || req.path === '/refresh-token') {
        return next() // Skip authentication for login and refresh token routes
    }
    try {
        // Here you would normally check the Authorization header for a valid token
        const accessToken = req.headers?.authorization?.split('Bearer ')[1] //Will creat a list of the header and split it by 'Bearer ' and take the second part which is the token
        if (!accessToken) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        //if valid token, call next()
        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN_SECRET,
        )

        //if not valid, return 401 Unauthorized
        if (!decodedToken) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        req.userId = decodedToken.userId // Attach userId to request object for later use

        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Unauthorized' })
    }
}
