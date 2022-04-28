import axios from 'axios';
async function conection(url){
    let response = null;
    try {
        response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': '41282c59-9765-43a1-8754-447f88ed4f5c',
            },
        });
    } catch(ex) {
        response = null;
        // error
        console.log(ex);
    }
    if (response) {
        // success
        const json = response.data;
        console.log(json);
        return json
    }
}
export{
    conection
}