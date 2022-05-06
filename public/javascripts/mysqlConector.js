import mysql from 'mysql2/promise.js'
async function consulta(query) {
    const connection = await mysql.createConnection({host:'localhost', user: 'admin',password: 'Correa28', database: 'CryptoDet',port: 3306});
    const [rows, fields] = await connection.execute(query);
    return rows
}

export {
    consulta
}