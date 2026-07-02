const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = new URL(process.env.TIDB_URL);

// Se configura un pool de conexiones para asegurar rendimiento y reuso.
const pool = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true // Para TiDB Cloud
    }
});

module.exports = pool;
