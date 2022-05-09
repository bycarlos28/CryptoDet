import CryptoJS  from 'crypto-js';

function encriptar(password){
    let encrip = CryptoJS.SHA256(password).toString()
    return encrip
}
export{
    encriptar,
}