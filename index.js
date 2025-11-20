import 'dotenv/config.js'
import express from 'express'
import multer from 'multer'

import { CreateUserController } from './src/controllers/create-user.js'
import { UpdateMachineController } from './src/controllers/update-machine.js'
import { UpdateHistoryController } from './src/controllers/update-history.js'
import cors from 'cors'
import fs from 'fs'

// const express = require('express')
// const bodyParser = require("body-parser");

import { PostgresHelper } from './src/db/postgres/helper.js'
import { CreateHistoryController } from './src/controllers/create-history.js'

const app = express()
app.use(cors())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './media-folder/upload/')
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniquePrefix + '-' + file.originalname)
    },
})

const upload = multer({ storage })

app.use(express.json())

// app.post(
//     '/api/create/machine',
//     upload.single('file'), // multer saves the file first
//     async (request, response) => {
//         // attach filename to the body so controller can see it
//         if (request.file) {
//             request.body.params = request.body.params || {}
//             request.body.params.file_service_name = request.file.filename
//         }

//         const createUserController = new CreateUserController()
//         const { statusCode, body } = await createUserController.execute(request)
//         response.status(statusCode).send(body)
//     },
// )

//The one working
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
    const results = await PostgresHelper.query(
        'SELECT * FROM area ORDER BY title;',
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//FILTERED ROUTES
//get all the machines for summary
app.get('/maintenance/machines/summary', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine ORDER BY machine_type, model;',
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get all the machines for archived
app.get('/maintenance/machines/archived', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE status <> $1 ORDER BY machine_type, model;',
        ['active'],
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get all the machines for Brake Test
app.get('/maintenance/machines/braketest', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE brake_test = $1 ORDER BY machine_type, model;',
        [true],
    )
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//END OF FILTERED ROUTES

//get area by ID
app.get('/maintenance/areas/:ID', async (request, response) => {
    const id = parseInt(request.params.ID)
    const results = await PostgresHelper.query(
        'SELECT * FROM area WHERE id = $1 ORDER BY title',
        [id],
    )
    response.send(JSON.stringify(results[0]))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//Get machines by area ID
app.get('/maintenance/machines/:areaId', async (request, response) => {
    const areaId = parseInt(request.params.areaId)
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE area_id = $1 AND status = $2 ORDER BY machine_type, model',
        [areaId, 'active'],
    )
    response.send(JSON.stringify(results))
})

//Get machine by ID
app.get('/maintenance/machine/:id', async (request, response) => {
    //SELECT * FROM machine AS A INNER JOIN area AS B ON A.area_id = B.id WHERE id = $1;
    const results = await PostgresHelper.query(
        'SELECT * FROM machine WHERE id = $1',
        [request.params.id],
    )
    response.send(JSON.stringify(results[0]))
})

//Get history by ID
app.get('/maintenance/history/:id', async (request, response) => {
    const results = await PostgresHelper.query(
        'SELECT * FROM history WHERE id = $1',
        [request.params.id],
    )
    response.send(JSON.stringify(results[0]))
})

//Get histories by machine ID
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

app.post('/api/uploads', upload.single('file'), (request, response) => {
    response.json(request.file)
    console.log(request.file.filename)
    //try the below next
    // response.send(response.json(request.file))
})

//Get PDF attachment
app.get('/api/downloads', (req, res) => {
    // response.send('It gets here')
    fs.readFile('./media-folder/upload/Precast Sizes.pdf', (err, data) => {
        if (err) {
            res.writeHead(500, { 'content-type': 'text/plain' })
            res.end('Error reading file')
        } else {
            res.writeHead(200, {
                'content-type': 'application/pdf',
                'content-disposition': 'inline ; filename=Precast Sizes.pdf',
            })
            res.end(data)
        }
    })

    // const file = fs.createReadStream('./media-folder/upload/Precast Sizes.pdf')
    // const stat = fs.statSync('./media-folder/upload/Precast Sizes.pdf')
    // res.setHeader('Content-Length', stat.size)
    // res.setHeader('Content-Type', 'application/pdf')
    // res.setHeader(
    //     'Content-Disposition',
    //     'attachment; filename=Precast Sizes.pdf',
    // )
    // file.pipe(res)
})

app.listen(process.env.PORT, () => {
    console.log(`App running on port ${process.env.PORT}.`)
})
