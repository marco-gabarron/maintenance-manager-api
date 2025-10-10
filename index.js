import 'dotenv/config.js'
import express from 'express'
import { CreateUserController } from './src/controllers/create-user.js'
import cors from 'cors'

// const express = require('express')
// const bodyParser = require("body-parser");

import { PostgresHelper } from './src/db/postgres/helper.js'
import { CreateHistoryController } from './src/controllers/create-history.js'

const app = express()
app.use(cors())
// const db = require("./queries");

// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

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

//Machine update endpoint - to be implemented
app.patch('/api/update/machine/:machineId', async (request, response) => {
    const createHistoryController = new CreateHistoryController()
    const { statusCode, body } = await createHistoryController.execute(request)
    response.status(statusCode).send(body)
})

app.get('/maintenance/areas', async (request, response) => {
    const results = await PostgresHelper.query('SELECT * FROM area;')
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

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
        'SELECT * FROM machine WHERE area_id = $1',
        [areaId],
    )
    response.send(JSON.stringify(results))
})

app.get('/maintenance/machine/:id', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE ID = $1',
        [request.params.id],
    )
    response.send(JSON.stringify(results[0]))
})

app.get('/maintenance/history/:id', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM history WHERE id = $1',
        [request.params.id],
    )
    console.log(results)
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
