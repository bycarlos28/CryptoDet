import mysql from 'mysql2/promise.js'
async function consulta(query) {
    const connection = await mysql.createConnection({host: process.env.HOST_DB, user: process.env.USER_DB, password: process.env.PASSWORD_DB, database: process.env.DATABASE_DB});
    const [rows, fields] = await connection.execute(query);
    return rows
}

export {
    consulta
}