require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function initDB() {
    try {
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database', err);
    } finally {
        await pool.end();
    }
}

initDB();
