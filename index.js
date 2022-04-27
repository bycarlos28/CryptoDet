import express from 'express';
import path from 'path';
import {consulta} from './public/js/conector.js';
const app = express()
const port = 3000
const __dirname = path.resolve();

app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/consulta/:query', (req,res) =>{
    let sql = req.params.query;
    consulta(sql,(err,result) => {
        if(err) throw err
        res.json(result)
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

