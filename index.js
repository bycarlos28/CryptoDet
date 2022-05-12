import express from 'express';
import session from 'express-session'
import path from 'path';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import {conection} from './public/javascripts/apiConector.js'
import {encriptar} from './public/javascripts/encriptar.js'
import {consulta} from './public/javascripts/mysqlConector.js';
import {getPrice,getDataCoin,getPrice_7days,updatePortfolio,updatePortfolio_7days} from './public/javascripts/apiFunctions.js'

const app = express();
app.use(session({secret: 'estoeslaclavesecretaparaadministarsessiones', cookie: { maxAge: 60000 }}));
const port = process.env.PORT || 3000
const __dirname = path.resolve();

// cron.schedule("*/5 * * * *",async() =>{
//     await getPrice()
//     await updatePortfolio()
// })

// cron.schedule("*/15  * * * *",async() =>{
//     await getPrice_7days()
//     await updatePortfolio_7days()
// })

// cron.schedule("*/720 * * * *",async() =>{
//     await getDataCoin()
// })

app.use(bodyParser.urlencoded({extended: false}));
app.use('/static', express.static(__dirname + '/public'));
app.use('/js', express.static(path.join(__dirname, 'public/javascripts')))
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')))
app.use('/img', express.static(path.join(__dirname, 'public/images')))
app.set('view engine', 'ejs');

var auth = function(req, res, next) {
    if (req.session && req.session.user){
        return next();
    }else{
        res.redirect('/login')
    }
};

var auth_destroy = function(req, res, next) {
    if (req.session && req.session.user){
        req.session.destroy();
        return next();
    }
};

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

app.get('/login',(req, res) => {
    res.render('account',{ form : "partials/login.ejs" })
})

app.post('/login',async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let user = await consulta("Select * from Users where username like '"+username+"';");
    let context= {}
    let msg_username = "El usuario"+username+" no existe";
    let msg_password = "La contraseña introducida es incorrecta"
    if(user.length == 0){
        context['msg_username'] = msg_username
        res.render('account',{ form : "partials/login.ejs",context})
    }else{
        if(encriptar(password) == user[0].password){
            req.session.user = username;
            req.session.user_id = user[0].user_id;
            res.redirect('/')
        }else{
            context['msg_password'] = msg_password
            res.render('account',{ form : "partials/login.ejs",context})
        }
    }
})

app.get('/register',(req, res) => {
    res.render('account',{ form : "partials/register.ejs" })
})

app.post('/register',async(req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let birth_date =  req.body.birth_date;
    let password =  encriptar(req.body.password);
    let users = await consulta("Select * from Users where username like '"+username+"';");
    let emaìls = await consulta("Select * from Users where email like '"+email+"';");
    let msg_username = "El nombre de usuario "+username+" ya esta en uso"
    let msg_email = "El correo electronico "+email+" ya esta en uso"
    let context= {}
    let validar = true
    if(users.length != 0){
        context['msg_username'] = msg_username
        validar = false
    }
    if(emaìls.length != 0){
        context['msg_email'] = msg_email
        validar = false
    }
    if(validar == false){
        res.render('account',{ form : "partials/register.ejs",context})
    }else{
        let register_user = await consulta("Insert into Users (username,email,password,birth_date) values ('"+username+"','"+email+"','"+password+"','"+birth_date+"');");
        res.redirect('/login')
    }
})

app.get('/logout',auth_destroy,(req, res) => {
    res.redirect('/login')
})

app.get('/createportfolio', (req, res) => {
    res.render('newPortfolio')
})

app.get('/addAsset/:portfolio_id/:coin_id?', async (req, res) => {
    const default_coin = req.params.coin_id ? req.params.coin_id : 1
    const portfolio_id = req.params.portfolio_id
    let coins = {}
    try {
        const query = 'SELECT * FROM coins ORDER BY name'
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            coins=response.data
        })
    }
    catch (err) {
        console.error(err);
    }
    res.render('addAsset', {portfolio_id, coins, default_coin})
})

app.get('/confirmdelete/:toDelete/:id', async (req, res) => {
    const toDelete = req.params.toDelete
    let dataToDelete
    let query
    if (toDelete == "portfolio") {
        query = 'SELECT * FROM portfolios WHERE portfolio_id='+req.params.id+';'
    } else if (toDelete == "asset") {
        query = 'SELECT * FROM portfolios p INNER JOIN assets a ON p.portfolio_id = a.portfolio_id INNER JOIN coins c ON a.coin_id = c.coin_id WHERE a.coin_id='+req.params.id+';'
    } else if (toDelete == "transaction") {
        query = 'SELECT * FROM portfolios p INNER JOIN transactions t ON p.portfolio_id = t.portfolio_id INNER JOIN coins c ON t.coin_id = c.coin_id WHERE t.transaction_id='+req.params.id+';'
    }
    try {
        await axios.get('http://localhost:3001/consulta/'+query).then(response => {
            dataToDelete=response.data[0]
        })
    }
    catch (err) {
        console.error(err);
    }
    res.render('confirmDelete',{dataToDelete, toDelete})
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
        const query = 'SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+1+' ORDER BY c.name;' // TODO: Cambiar el id de alumno por el obtenido desde session
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
        const query = 'SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+1+' ORDER BY c.name;' // TODO: Cambiar el id de alumno por el obtenido desde session
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
        const query = 'SELECT c.coin_id, c.name, c.abbreviation, a.amount, a.spended FROM assets a INNER JOIN coins c ON a.coin_id=c.coin_id INNER JOIN portfolios p ON a.portfolio_id=p.portfolio_id WHERE p.portfolio_id='+portfolio_id+';'
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

app.get('/CryptoDetApi/:url', (req, res) => {
    let url = req.params.url
    console.log(url)
    console.log(conection(url))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})