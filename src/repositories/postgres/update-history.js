import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresUpdateHistoryRepository {
    async execute(historyId, updateHistoryParams) {
        const updateFields = []
        const updateValues = []

        Object.keys(updateHistoryParams).forEach((key) => {
            updateFields.push(`${key} = $${updateValues.length + 1}`)
            updateValues.push(updateHistoryParams[key])
        })

        updateValues.push(historyId)

        const updateQuery = `
        UPDATE history 
        SET ${updateFields.join(', ')}
        WHERE id = $${updateValues.length} 
        RETURNING *
        `

        const updatedHistory = await PostgresHelper.query(
            updateQuery,
            updateValues,
        )

        return updatedHistory[0]
    }
}
