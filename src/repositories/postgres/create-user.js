import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresCreateUserRepository {
    async execute(createUserParams) {
        // create user in postgres
        return await PostgresHelper.query(
            'INSERT INTO machine(ID, area_id, machine_type, model, plant, manufacturer, year, serial_number, brake_test, service_frequency, hours, mileage, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [
                createUserParams.ID,
                createUserParams.area_id,
                createUserParams.machine_type,
                createUserParams.model,
                createUserParams.plant,
                createUserParams.manufacturer,
                createUserParams.year,
                createUserParams.serial_number,
                createUserParams.brake_test,
                createUserParams.service_frequency,
                createUserParams.hours,
                createUserParams.mileage,
                createUserParams.status,
            ],
        )
    }
}
