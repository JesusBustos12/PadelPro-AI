const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Se configura un pool de conexiones para asegurar rendimiento y reuso.
const pool = mysql.createPool({
    uri: process.env.TIDB_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true // Para TiDB Cloud
    }
});

module.exports = pool;
