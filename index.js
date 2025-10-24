import 'dotenv/config.js'
import express from 'express'
import { CreateUserController } from './src/controllers/create-user.js'
import { UpdateMachineController } from './src/controllers/update-machine.js'
import { UpdateHistoryController } from './src/controllers/update-history.js'
import cors from 'cors'

// const express = require('express')
// const bodyParser = require("body-parser");

import { PostgresHelper } from './src/db/postgres/helper.js'
import { CreateHistoryController } from './src/controllers/create-history.js'

const app = express()
app.use(cors())

app.use(express.json())

app.post('/api/create/machine', async (request, response) => {
    const createUserController = new CreateUserController()
    const { statusCode, body } = await createUserController.execute(request)
    response.status(statusCode).send(body)
})

app.post('/api/create/history', async (request, response) => {
    const createHistoryController = new CreateHistoryController()
    const { statusCode, body } = await createHistoryController.execute(request)
    response.status(statusCode).send(body)
})

//Machine update endpoint
app.patch('/api/update/machine/:machineId', async (request, response) => {
    const updateMachineController = new UpdateMachineController()
    const { statusCode, body } = await updateMachineController.execute(request)
    response.status(statusCode).send(body)
})

//History update endpoint
app.patch('/api/update/history/:historyId', async (request, response) => {
    const updateHistoryController = new UpdateHistoryController()
    const { statusCode, body } = await updateHistoryController.execute(request)
    response.status(statusCode).send(body)
})

//Get all areas
app.get('/maintenance/areas', async (request, response) => {
    const results = await PostgresHelper.query('SELECT * FROM area;')
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//FILTERED ROUTES

app.get('/maintenance/machines/summary', async (request, response) => {
    const results = await PostgresHelper.query('SELECT * FROM machine;')
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/maintenance/machines/archived', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE status <> $1;',
        ['active'],
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/maintenance/machines/braketest', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE brake_test = $1;',
        [true],
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//END OF FILTERED ROUTES

app.get('/maintenance/areas/:ID', async (request, response) => {
    const id = parseInt(request.params.ID)
    const results = await PostgresHelper.query(
        'SELECT * FROM area WHERE id = $1',
        [id],
    )
    response.send(JSON.stringify(results[0]))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/maintenance/machines/:areaId', async (request, response) => {
    const areaId = parseInt(request.params.areaId)
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE area_id = $1 AND status = $2',
        [areaId, 'active'],
    )
    response.send(JSON.stringify(results))
})

app.get('/maintenance/machine/:id', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE id = $1',
        [request.params.id],
    )
    response.send(JSON.stringify(results[0]))
})

app.get('/maintenance/history/:id', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM history WHERE id = $1',
        [request.params.id],
    )
    response.send(JSON.stringify(results[0]))
})

app.get(
    '/maintenance/machine/histories/:machineId',
    async (request, response) => {
        const results = await PostgresHelper.query(
            'SELECT * FROM history WHERE machine_id = $1',
            [request.params.machineId],
        )
        response.send(JSON.stringify(results))
    },
)

// app.get("/customers", db.getUsers);
// app.get("/customers/:id", db.getUserById);
// app.post("/customers", db.createUser);
// app.put("/customers/:id", db.updateUser);
// app.delete("/customers/:id", db.deleteUser);

app.listen(process.env.PORT, () => {
    console.log(`App running on port ${process.env.PORT}.`)
})
