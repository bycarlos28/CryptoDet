import mysql from "mysql";

const config = {
    host:'localhost',
    user:'root',
    password:'toor',
    database:'CryptoDet',
    port: 3306
}
const conector = mysql.createConnection(config);

//Funcion consulta datos

const consulta = (sql, callback) =>{
    conector.query(sql, (err, result) =>{
        if(err){
            callback(err, null)
        }else{
            callback(null,result)
        }
    })
}

export {
    consulta
}