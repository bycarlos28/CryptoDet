import bcrypt from 'bcryptjs';

function encriptar(password){
    let rondasDeSal = 10;
    bcrypt.hash(password, rondasDeSal, (err, palabraSecretaEncriptada) => {
        if (err) {
            console.log("Error hasheando:", err);
        } else {
            console.log("Y hasheada es: " + palabraSecretaEncriptada);
        }
    });
}

function desencriptar(passwordHash,password){
    bcrypt.compare(password, passwordHash, (err, coinciden) => {
        if (err) {
            console.log("Error comprobando:", err);
        } else {
            console.log("¿La contraseña coincide?: " + coinciden);
        }
    });
}
export{
    encriptar,
    desencriptar
}