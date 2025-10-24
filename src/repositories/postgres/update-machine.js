import { PostgresHelper } from '../../db/postgres/helper.js'

export class PostgresUpdateMachineRepository {
    async execute(machineId, updateMachineParams) {
        const updateFields = []
        const updateValues = []

        Object.keys(updateMachineParams).forEach((key) => {
            updateFields.push(`${key} = $${updateValues.length + 1}`)
            updateValues.push(updateMachineParams[key])
        })

        updateValues.push(machineId)

        const updateQuery = `
        UPDATE machine 
        SET ${updateFields.join(', ')}
        WHERE id = $${updateValues.length} 
        RETURNING *
        `

        const updatedMachine = await PostgresHelper.query(
            updateQuery,
            updateValues,
        )

        return updatedMachine[0]
    }
}
