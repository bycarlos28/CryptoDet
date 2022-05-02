import express from 'express';
import path from 'path';
import axios from 'axios';
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

app.get('/portfolio/:id', async (req, res) => {
    // All user's portfolios to print in the left list
    let portfolios = {}
    try {
        const query = 'SELECT * from portfolios where user_id = '+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            portfolios=response.data
        })
    }
    catch (err) {
        console.error(err);
    }
    
    // The portfolio we want to show
    let portfolio = {}
    try {
        const query = 'SELECT * from portfolios where portfolio_id = "'+req.params.id+'";'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            portfolio=response.data[0]

        })
    }
    catch (err) {
        console.error(err);
    }
    
    // Getting user's favourite coins
    let favourites = {}
    try {
        const query = 'SELECT f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id=1 = '+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            favourites=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    // Getting the asset from the portfolio we wanna show
    const assets = [
        {"id": 0, "portfolio_id" : 4, "coinid" : 0, "ammount" : 6000, "spended" : 500}
    ]

    res.render('portfolio', {portfolios, portfolio, favourites, assets})
})

app.get('/consulta/:query', (req,res) =>{
    let sql = req.params.query;
    consulta(sql,(err,result) => {
        if(err) throw err
        res.json(result)
    })
})

app.get('/CryptoDetApi/:url', (req, res) => {
    let url = req.params.url
    return conection(url)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

