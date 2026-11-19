import { PostgresHelper } from '../../db/postgres/helper.js'
import { v4 as uuidv4 } from 'uuid'

export class PostgresCreateChecklistRepository {
    async execute(createChecklistParams) {
        // create user in postgres
        await PostgresHelper.query(
            'INSERT INTO checklist(id, machine_id, comments, date, completed, defective, open, completed_by) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                createChecklistParams.id,
                createChecklistParams.machine_id,
                createChecklistParams.comments,
                createChecklistParams.date,
                createChecklistParams.completed,
                createChecklistParams.defective,
                createChecklistParams.open,
                createChecklistParams.completed_by,
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
                    'INSERT INTO questionnaire_checklist(id, question_id, value, checklist_id, text) VALUES($1, $2, $3, $4, $5)',
                    [
                        questionnaireId,
                        questionId,
                        questionnaire.value,
                        createChecklistParams.id,
                        questionnaire.text,
                    ],
                )
            }
        }

        const createdChecklist = await PostgresHelper.query(
            'SELECT A.*, json_agg(B) AS questionnaire FROM checklist as A INNER JOIN questionnaire_checklist as B on A.id = B.checklist_id WHERE A.machine_id = $1 AND A.date = $2 GROUP BY A.id;',
            [createChecklistParams.machine_id, createChecklistParams.date],
        )
        return createdChecklist[0]
    }
}
