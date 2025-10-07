import 'dotenv/config.js'
import fs from 'fs'
import { pool } from '../helper.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execMigrations = async () => {
    const client = await pool.connect() // Get a Postgres client from the pool

    try {
        const filepath = path.join(__dirname, '01-init.sql') // Path to your SQL file
        const script = fs.readFileSync(filepath, 'utf-8') // Read the SQL file

        await client.query(script) // Execute the SQL script

        console.log('Migration executed successfully')
    } catch (error) {
        console.error('Error executing migration:', error)
    } finally {
        await client.release() // Release the client back to the pool
    }
}

execMigrations()
