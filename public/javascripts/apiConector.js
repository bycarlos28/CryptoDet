import axios from 'axios';

let response = null;
async function conection(url,header){
    try {
        response = await axios.get(url, {
            headers: header,
        });
    } catch(ex) {
        response = null;
        // errorx
    }
    if (response) {
        // success
        const json = response.data;
        return json
    }
}
export{
    conection
}