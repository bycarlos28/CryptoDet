import express from 'express';
import path from 'path';
import axios from 'axios';
import {consulta} from './public/javascripts/conector.js';
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

app.get('/', async (req, res) => {
    let coins = {}
    try {
        const query = 'SELECT * FROM coins'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            coins=response.data
        })
    } catch (err) {
        console.error(err);
    }
    let favourites = {}
    let favourites_ids = []
    try {
        const query = 'SELECT * FROM favourites WHERE user_id=1 = '+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            favourites=response.data
        })
        favourites.forEach(function(favourite){
            favourites_ids.push(favourite.coin_id)
        })
    }
    catch (err) {
        console.error(err);
    }
    res.render('home', {coins, favourites, favourites_ids})
})

app.get('/createportfolio', (req, res) => {
    res.render('newPortfolio')
})

app.get('/addAsset/:portfolio_id', async (req, res) => {
    const portfolio_id = req.params.portfolio_id
    let coins = {}
    try {
        const query = 'SELECT * FROM coins'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            coins=response.data
        })
    }
    catch (err) {
        console.error(err);
    }
    res.render('addAsset', {portfolio_id, coins})
})

app.get('/deleteportfolio/:id', async (req, res) => {
    let portfolio = {}
    try {
        const query = 'SELECT * FROM portfolios WHERE portfolio_id='+req.params.id+';'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            portfolio=response.data[0]
        })
    }
    catch (err) {
        console.error(err);
    }
    res.render('deletePortfolio',{portfolio})
})


app.get('/coin/:abb', async (req, res) => {
    // Getting the coin from url
    let coin = {}
    const abbreviation=req.params.abb.toUpperCase()
    try {
        const query = 'SELECT * FROM coins WHERE abbreviation="'+abbreviation+'";'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            coin=response.data[0]
        })
    }
    catch (err) {
        console.error(err);
    }

    // Getting coin's contracts
    let contracts = {}
    try {
        const query = 'SELECT ct.platform, ct.token_address FROM coins c INNER JOIN contracts ct ON c.coin_id = ct.coin_id WHERE c.abbreviation="'+abbreviation+'";'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            contracts=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    // Getting coin's social links
    let socials = {}
    try {
        const query = 'SELECT s.type, s.platform, s.url FROM coins c INNER JOIN socials s ON c.coin_id = s.coin_id WHERE c.abbreviation="'+abbreviation+'";'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            socials=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    // Getting user's favourite coins
    let favourites = {}
    try {
        const query = 'SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            favourites=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    let isfavourite = false
    let favourite_id
    favourites.forEach(favourite => {
        if (coin.coin_id == favourite.coin_id) {
            isfavourite = true
            favourite_id = favourite.favourites_id
        }
    });
    res.render('coin', {coin, contracts, socials, favourites, isfavourite, favourite_id})
})

app.get('/portfolio/:id', async (req, res) => {
    // All user's portfolios to print in the left list
    const portfolio_id = req.params.id
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
        const query = 'SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            favourites=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    // Getting the assets from the portfolio we wanna show
    let assets = {}
    try {
        const query = 'SELECT c.name, c.abbreviation, a.amount, a.spended FROM assets a INNER JOIN coins c ON a.coin_id=c.coin_id INNER JOIN portfolios p ON a.portfolio_id=p.portfolio_id WHERE p.user_id='+1+';' // TODO: Cambiar el id de alumno por el obtenido desde session and ADD columns price and profit/loss
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            assets=response.data
        })
    }
    catch (err) {
        console.error(err);
    }

    res.render('portfolio', {portfolios, portfolio, favourites, assets, portfolio_id})
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

