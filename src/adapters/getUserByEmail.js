import { PostgresHelper } from '../db/postgres/helper.js'

//Get histories by machine ID
export class getUserByEmail {
    async execute(email) {
        const result = await PostgresHelper.query(
            'SELECT * FROM users WHERE email = $1',
            [email],
        )
        return result[0]
    }
}
