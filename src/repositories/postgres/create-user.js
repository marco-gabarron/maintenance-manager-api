import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresCreateUserRepository {
    async execute(createUserParams) {
        // create user in postgres
        await PostgresHelper.query(
            'INSERT INTO machine(ID, area_id, model, plant, manufacturer, year, serial_number, service_frequency, hours, mileage, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [
                createUserParams.ID,
                createUserParams.area_id,
                createUserParams.model,
                createUserParams.plant,
                createUserParams.manufacturer,
                createUserParams.year,
                createUserParams.serial_number,
                createUserParams.service_frequency,
                createUserParams.hours,
                createUserParams.mileage,
                createUserParams.status,
            ],
        )

        const createdMachine = await PostgresHelper.query(
            'SELECT * FROM machine WHERE ID = $1',
            [createUserParams.ID],
        )
        return createdMachine[0]
    }
}
