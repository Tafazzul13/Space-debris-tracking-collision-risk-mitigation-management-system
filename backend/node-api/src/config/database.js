const mysql = require('mysql2/promise');

let pool = null;

async function connect() {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword',
        database: process.env.DB_NAME || 'space_debris_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    const conn = await pool.getConnection();
    console.log('MySQL connected');
    conn.release();
}

function getPool() {
    if (!pool) throw new Error('Database pool not initialized');
    return pool;
}

module.exports = { connect, getPool };
