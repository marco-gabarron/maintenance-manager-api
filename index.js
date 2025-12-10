import 'dotenv/config.js'
import express from 'express'
// import multer from 'multer'

import { CreateUserController } from './src/controllers/create-user.js'
import { UpdateMachineController } from './src/controllers/update-machine.js'
import { UpdateHistoryController } from './src/controllers/update-history.js'
import cors from 'cors'
import fs from 'fs'
import xl from 'excel4node'

// const express = require('express')
// const bodyParser = require("body-parser");

import { PostgresHelper } from './src/db/postgres/helper.js'
import { CreateHistoryController } from './src/controllers/create-history.js'

const app = express()
app.use(cors())

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './media-folder/upload/')
//     },
//     filename: function (req, file, cb) {
//         const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//         cb(null, uniquePrefix + '-' + file.originalname)
//     },
// })

// const upload = multer({ storage })

app.use(express.json())

const querySummary =
    'SELECT A.title AS area, B.machine_type, B.model, B.manufacturer, B.year, B.hours, B.mileage, B.serial_number FROM area AS A INNER JOIN machine AS B ON A.id = B.area_id ORDER BY A.title, B.machine_type, B.model;'

const queryArchived =
    "SELECT A.title AS area, B.service_frequency, B.id, B.plant, B.machine_type, B.model, B.manufacturer, B.year, B.hours, B.mileage, B.serial_number FROM area AS A INNER JOIN machine AS B ON A.id = B.area_id WHERE B.status <> 'active' ORDER BY A.title, B.machine_type, B.model;"

const queryBrakeTest =
    "SELECT A.title AS area, B.machine_type, B.model, B.manufacturer, B.year, B.hours, B.mileage, B.serial_number FROM area AS A INNER JOIN machine AS B ON A.id = B.area_id WHERE B.brake_test = true  AND B.status = 'active' ORDER BY A.title, B.machine_type, B.model;"
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

const createWorkbook = (headerText) => {
    const workbook = new xl.Workbook()

    // Add Worksheets to the workbook
    const machineSheet = workbook.addWorksheet('Machines')
    // const historySheet = workbook.addWorksheet('Histories')

    // Create a reusable style
    const defaultStyle = workbook.createStyle({
        font: { color: '#000000', size: 12 },
        numberFormat: '#,###; (#,###); -',
        border: {
            left: { style: 'thin', color: '#000000' },
            right: { style: 'thin', color: '#000000' },
            top: { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' },
        },
    })

    const defaultYearStyle = workbook.createStyle({
        font: { color: '#000000', size: 12 },
        border: {
            left: { style: 'thin', color: '#000000' },
            right: { style: 'thin', color: '#000000' },
            top: { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' },
        },
    })

    // Create a reusable style
    const defaultHeadersStyle = workbook.createStyle({
        font: { color: '#000000', size: 16, bold: true },
        alignment: { horizontal: 'center' },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'orange',
        },
        border: {
            left: { style: 'thin', color: '#000000' },
            right: { style: 'thin', color: '#000000' },
            top: { style: 'thin', color: '#000000' },
            bottom: { style: 'thin', color: '#000000' },
        },
    })

    machineSheet
        .cell(1, 1, 1, 8, true)
        .string(headerText)
        .style(defaultHeadersStyle)

    // Set Headers for machineSheet
    machineSheet.cell(2, 1).string('Area').style(defaultHeadersStyle)
    machineSheet.cell(2, 2).string('Machine Type').style(defaultHeadersStyle)
    machineSheet.cell(2, 3).string('Model').style(defaultHeadersStyle)
    machineSheet.cell(2, 4).string('Manufacturer').style(defaultHeadersStyle)
    machineSheet.cell(2, 5).string('Year').style(defaultHeadersStyle)
    machineSheet.cell(2, 6).string('Hours').style(defaultHeadersStyle)
    machineSheet.cell(2, 7).string('Mileage').style(defaultHeadersStyle)
    machineSheet.cell(2, 8).string('Serial Number').style(defaultHeadersStyle)

    machineSheet.column(1).setWidth(15)
    machineSheet.column(2).setWidth(25)
    machineSheet.column(3).setWidth(25)
    machineSheet.column(4).setWidth(30)
    machineSheet.column(5).setWidth(10)
    machineSheet.column(6).setWidth(10)
    machineSheet.column(7).setWidth(10)
    machineSheet.column(8).setWidth(35)

    machineSheet.row(1).setHeight(20)
    machineSheet.row(2).setHeight(20)

    // Set Headers for historySheet
    // historySheet.cell(1, 1).string('ID').style(defaultStyle)
    // historySheet.cell(1, 2).string('Machine ID').style(defaultStyle)
    // historySheet.cell(1, 3).string('Description').style(defaultStyle)
    // historySheet.cell(1, 4).string('Date').style(defaultStyle)

    return { workbook, machineSheet, defaultStyle, defaultYearStyle }
}

//Allow client to download spreadsheet
app.get('/maintenance/download/spreadsheet', async (request, response) => {
    let headerText = ''
    let query = ''
    const filter = request.query.filter

    if (filter === 'summary') {
        headerText = 'Summary Machines Report'
        query = querySummary
    } else if (filter === 'braketest') {
        headerText = 'Brake Test Machines Report'
        query = queryBrakeTest
    } else if (filter === 'archived') {
        headerText = 'Archived Machines Report'
        query = queryArchived
    } else {
        headerText = 'Maintenance Report'
    }

    const { workbook, machineSheet, defaultStyle, defaultYearStyle } =
        createWorkbook(headerText)

    const machines = await PostgresHelper.query(query)
    // const histories = await PostgresHelper.query(
    //     'SELECT * FROM history ORDER BY machine_id, date;',
    // )

    const cellString = (sheet, r, c, val) =>
        sheet
            .cell(r, c)
            .string(val == null ? '' : String(val))
            .style(defaultStyle)
    const cellNumber = (sheet, r, c, val) =>
        val == null || Number.isNaN(Number(val))
            ? sheet.cell(r, c).string('').style(defaultStyle)
            : sheet.cell(r, c).number(Number(val)).style(defaultStyle)
    const cellYear = (sheet, r, c, val) =>
        val == null || Number.isNaN(Number(val))
            ? sheet.cell(r, c).string('').style(defaultYearStyle)
            : sheet.cell(r, c).number(Number(val)).style(defaultYearStyle)
    // const cellBool = (sheet, r, c, val) =>
    //     val == null
    //         ? sheet.cell(r, c).string('').style(defaultStyle)
    //         : sheet.cell(r, c).bool(Boolean(val)).style(defaultStyle)
    // const cellDate = (sheet, r, c, val) =>
    //     val == null
    //         ? sheet.cell(r, c).string('').style(defaultStyle)
    //         : sheet.cell(r, c).date(new Date(val)).style(defaultStyle)

    machines.forEach((machine, index) => {
        const row = index + 3
        cellString(machineSheet, row, 1, machine.area)
        cellString(machineSheet, row, 2, machine.machine_type)
        cellString(machineSheet, row, 3, machine.model)
        cellString(machineSheet, row, 4, machine.manufacturer)
        cellYear(machineSheet, row, 5, machine.year)
        cellNumber(machineSheet, row, 6, machine.hours)
        cellNumber(machineSheet, row, 7, machine.mileage)
        cellString(machineSheet, row, 8, machine.serial_number)
    })

    // histories.forEach((history, index) => {
    //     const row = index + 2
    //     cellNumber(historySheet, row, 1, history.id)
    //     cellNumber(historySheet, row, 2, history.machine_id)
    //     cellString(historySheet, row, 3, history.description)
    //     cellDate(historySheet, row, 4, history.date)
    // })

    workbook
        .writeToBuffer()
        .then((buffer) => {
            response.setHeader(
                'Content-Disposition',
                'attachment; filename="maintenance_data.xlsx"',
            )
            response.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            response.send(buffer)
        })
        .catch((err) => {
            console.error('Excel generation error', err)
            response.status(500).send('Error generating spreadsheet')
        })
})

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
    const results = await PostgresHelper.query(querySummary)
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get all the machines for archived
app.get('/maintenance/machines/archived', async (request, response) => {
    const results = await PostgresHelper.query(queryArchived)
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get all the machines for archived
app.get('/maintenance/machines/archivedList', async (request, response) => {
    const results = await PostgresHelper.query(queryArchived)
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

//get all the machines for Brake Test
app.get('/maintenance/machines/braketest', async (request, response) => {
    const results = await PostgresHelper.query(queryBrakeTest)
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

// app.post('/api/uploads', upload.single('file'), (request, response) => {
//     response.json(request.file)
//     console.log(request.file.filename)
//     //try the below next
//     // response.send(response.json(request.file))
// })

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
})

app.listen(process.env.PORT, () => {
    console.log(`App running on port ${process.env.PORT}.`)
})
