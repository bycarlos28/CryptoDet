import mysql from 'mysql2/promise.js'
async function consulta(query) {
    const connection = await mysql.createConnection({host: process.env.HOST_DB, user: process.env.USER_DB, password: process.env.PASSWORD_DB, database: process.env.DATABASE_DB});
    const [rows, fields] = await connection.execute(query);
    connection.end()
    return rows
}
//host: process.env.HOST_DB, user: process.env.USER_DB, password: process.env.PASSWORD_DB, database: process.env.DATABASE_DB
const connection = await mysql.createConnection({host: 'eu-cdbr-west-02.cleardb.net', user: 'bbe3d30f13fe7c', password: '7f5d9623', database: 'heroku_8381c53b931a1c9'});
//
export {
    consulta
}