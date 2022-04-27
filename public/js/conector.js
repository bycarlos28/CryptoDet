import mysql from 'mysql';

const config = {
    host:'127.0.0.1',
    user:'admin',
    password:'Correa28',
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