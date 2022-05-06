import mysql from 'mysql2/promise.js'
async function consulta(query) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows, fields] = await connection.execute(query);
    return rows
}

export {
    consulta
}