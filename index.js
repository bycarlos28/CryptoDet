import express from 'express';
import path from 'path';
import {consulta} from './public/javascripts/conector.js';
import {conection} from './public/javascripts/apiConector.js'
const app = express()
const port = 3001
const __dirname = path.resolve();

app.use('/static', express.static(__dirname + '/public'));
app.use('/js', express.static(path.join(__dirname, 'public/javascripts')))
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')))
app.use('/img', express.static(path.join(__dirname, 'public/images')))
app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
    res.render('loggin')
})

app.get('/coin/:currency', (req, res) => {
    const content = {
        "name" : "Oasis Network",
        "abbreviation" : "ROSE",
        "price" : 0.21,
        "marketCap" : 749133400,
        "volume" : 71465582,
        "supply" : 3490000000
    }
    res.render('coin', {content})
})

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

app.get('/CryptoDetApi:url', (req, res) => {
    let url = req.params.url
    return conection(url)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

