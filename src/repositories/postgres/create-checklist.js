import { PostgresHelper } from '../../db/postgres/helper.js'
import { v4 as uuidv4 } from 'uuid'

export class PostgresCreateChecklistRepository {
    async execute(createChecklistParams) {
        // create user in postgres
        await PostgresHelper.query(
            'INSERT INTO checklist(id, machine_id, comments, date, completed, defective, closed, corrective_action) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                createChecklistParams.id,
                createChecklistParams.machine_id,
                createChecklistParams.comments,
                createChecklistParams.date,
                createChecklistParams.completed,
                createChecklistParams.defective,
                createChecklistParams.closed,
                createChecklistParams.corrective_action,
            ],
        )

        if (
            createChecklistParams.questionnaire_checklist &&
            createChecklistParams.questionnaire_checklist.length > 0
        ) {
            for (const questionnaire of createChecklistParams.questionnaire_checklist) {
                const questionnaireId = uuidv4()
                const questionId = parseInt(questionnaire.question_id)
                await PostgresHelper.query(
                    'INSERT INTO questionnaire_checklist(id, question_id, value, checklist_id) VALUES($1, $2, $3, $4)',
                    [
                        questionnaireId,
                        questionId,
                        questionnaire.value,
                        createChecklistParams.id,
                    ],
                )
            }
        }

        const createdChecklist = await PostgresHelper.query(
            'SELECT * FROM checklist WHERE id = $1',
            [createChecklistParams.id],
        )
        return createdChecklist[0]
    }
}
