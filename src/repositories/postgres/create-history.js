import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresCreateHistoryRepository {
    async execute(createHistoryParams) {
        console.log(
            createHistoryParams.files_service_report,
            createHistoryParams.ID,
        )

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
                // typeof createHistoryParams.file_service_report === 'string'
                //     ? createHistoryParams.file_service_report
                //     : null,
            ],
        )

        if (createHistoryParams.files_service_report) {
            for (const file of createHistoryParams.files_service_report) {
                await PostgresHelper.query(
                    'INSERT INTO service_report(id, name, url, history_id) VALUES($1, $2, $3, $4)',
                    [
                        file.id,
                        file.name,
                        file.secure_url,
                        createHistoryParams.ID,
                        // typeof createHistoryParams.file_service_report === 'string'
                        //     ? createHistoryParams.file_service_report
                        //     : null,
                    ],
                )
            }
        }

        const createdHistory = await PostgresHelper.query(
            'SELECT * FROM history WHERE ID = $1',
            [createHistoryParams.ID],
        )
        return createdHistory[0]
    }
}
