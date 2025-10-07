import 'dotenv/config.js'
import express from 'express'

// const express = require('express')
// const bodyParser = require("body-parser");

import { PostgresHelper } from './src/db/postgres/helper.js'

const app = express()
// const db = require("./queries");
const port = 3000

// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

app.use(express.json())

app.get('/', async (request, response) => {
    console.log(request.body)
    console.log(request.header)
    const results = await PostgresHelper.query('SELECT * FROM machine;')
    response.send(JSON.stringify(results))
    // response.json({ info: 'Node.js, Express, and Postgres API' })
})

// app.get("/customers", db.getUsers);
// app.get("/customers/:id", db.getUserById);
// app.post("/customers", db.createUser);
// app.put("/customers/:id", db.updateUser);
// app.delete("/customers/:id", db.deleteUser);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
