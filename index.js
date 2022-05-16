import express from 'express';
import session from 'express-session'
import path from 'path';
import bodyParser from 'body-parser';
import {encriptar} from './public/javascripts/encriptar.js'
import {consulta} from './public/javascripts/mysqlConector.js';
const app = express();
app.use(session({secret: 'estoeslaclavesecretaparaadministarsessiones'}));
const port = process.env.PORT || 3001
const __dirname = path.resolve();

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

app.get('/',async (req, res) => {
    let user_id = req.session.user_id
    let coins =  await consulta('SELECT * FROM coins');
    let favourites;
    let favourites_ids = []
    if(user_id == undefined){
        user_id = undefined
    }else{
        favourites = await consulta('SELECT * FROM favourites WHERE user_id = '+user_id+';')
        for(let i=0; i != favourites.length; i++){
            favourites_ids.push(favourites[i].coin_id)
        }
    }
    res.render('home', {coins, favourites, favourites_ids,user_id})
})

app.get('/login',(req, res) => {
    let user_id = req.session.user_id
    res.render('account',{ form : "partials/login.ejs",user_id })
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
    let user_id = req.session.user_id
    res.render('account',{ form : "partials/register.ejs",user_id })
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

app.get('/createportfolio',auth, (req, res) => {
    res.render('newPortfolio')
})

app.get('/addAsset/:portfolio_id/:coin_id?',auth, async (req, res) => {
    const default_coin = req.params.coin_id ? req.params.coin_id : 1
    const portfolio_id = req.params.portfolio_id
    let coins = await consulta('SELECT * FROM coins ORDER BY name');
    res.render('addAsset', {portfolio_id, coins, default_coin})
})

app.get('/confirmdelete/:toDelete/:id',auth, async (req, res) => {
    const toDelete = req.params.toDelete
    let query
    if (toDelete == "portfolio") {
        query = 'SELECT * FROM portfolios WHERE portfolio_id='+req.params.id+';'
    } else if (toDelete == "asset") {
        query = 'SELECT * FROM portfolios p INNER JOIN assets a ON p.portfolio_id = a.portfolio_id INNER JOIN coins c ON a.coin_id = c.coin_id WHERE a.coin_id='+req.params.id+';'
    } else if (toDelete == "transaction") {
        query = 'SELECT * FROM portfolios p INNER JOIN transactions t ON p.portfolio_id = t.portfolio_id INNER JOIN coins c ON t.coin_id = c.coin_id WHERE t.transaction_id='+req.params.id+';'
    }
    let dataToDelete = await consulta(query);
    dataToDelete = dataToDelete[0]
    res.render('confirmDelete',{dataToDelete, toDelete})
})

app.get('/coin/:abb',auth, async (req, res) => {
    let user_id = req.session.user_id
    // Getting the coin from url
    const abbreviation=req.params.abb.toUpperCase()
    let coin = await consulta('SELECT * FROM coins WHERE abbreviation="'+abbreviation+'";');
    coin = coin[0]
    // Getting coin's contracts
    let contracts = await consulta('SELECT ct.platform, ct.token_address FROM coins c INNER JOIN contracts ct ON c.coin_id = ct.coin_id WHERE c.abbreviation="'+abbreviation+'";');
    // Getting coin's social links
    let socials = await consulta('SELECT s.type, s.platform, s.url FROM coins c INNER JOIN socials s ON c.coin_id = s.coin_id WHERE c.abbreviation="'+abbreviation+'";')
    // Getting user's favourite coins
    let favourites = await consulta('SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+user_id+' ORDER BY c.name;')
    let isfavourite = false
    let favourite_id
    favourites.forEach(favourite => {
        if (coin.coin_id == favourite.coin_id) {
            isfavourite = true
            favourite_id = favourite.favourites_id
        }
    });
    res.render('coin', {coin, contracts, socials, favourites, isfavourite, favourite_id,user_id})
})

app.get('/portfolio/:id', auth,async (req, res) => {
    let user_id = req.session.user_id
    // All user's portfolios to print in the left list
    const portfolio_id = req.params.id
    let portfolios = await consulta('SELECT * from portfolios where user_id = '+user_id+';');
    // The portfolio we want to show
    let portfolio = await consulta('SELECT * from portfolios where portfolio_id ='+portfolio_id+';');
    portfolio = portfolio[0];
    // Getting user's favourite coins
    let favourites = await consulta('SELECT f.favourites_id, f.user_id, f.coin_id, c.name, c.abbreviation FROM favourites f INNER JOIN coins c ON f.coin_id = c.coin_id WHERE f.user_id='+user_id+' ORDER BY c.name;');
    // Getting the assets from the portfolio we wanna show
    let assets = await consulta('SELECT c.coin_id, c.name, c.abbreviation, a.amount, a.spended FROM assets a INNER JOIN coins c ON a.coin_id=c.coin_id INNER JOIN portfolios p ON a.portfolio_id=p.portfolio_id WHERE p.portfolio_id='+portfolio_id+';');
    res.render('portfolio', {portfolios, portfolio, favourites, assets, portfolio_id,user_id})
})

app.get('/consulta/:query', async(req,res) =>{
    let sql = req.params.query;
    let query = await consulta(sql);
    res.json(query)
  })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})