import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresCreateHistoryRepository {
    async execute(createHistoryParams) {
        // create user in postgres
        await PostgresHelper.query(
            'INSERT INTO history(ID, machine_id, date, service_level, description, service_type, hours_service, mileage_service, completed_by) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [
                createHistoryParams.ID,
                createHistoryParams.machine_id,
                createHistoryParams.date,
                createHistoryParams.service_level,
                createHistoryParams.description,
                createHistoryParams.service_type,
                createHistoryParams.hours_service,
                createHistoryParams.mileage_service,
                createHistoryParams.completed_by,
            ],
        )

        const createdHistory = await PostgresHelper.query(
            'SELECT * FROM history WHERE ID = $1',
            [createHistoryParams.ID],
        )
        return createdHistory[0]
    }
}
