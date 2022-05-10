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

cron.schedule("*/5 * * * *",async() =>{
    await getPrice()
    await updatePortfolio()
})

cron.schedule("*/15  * * * *",async() =>{
    await getPrice_7days()
    await updatePortfolio_7days()
})

cron.schedule("*/720 * * * *",async() =>{
    await getDataCoin()
})

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

app.get('/',(req, res) => {
    res.render('home')
})

app.get('/login',(req, res) => {
    res.render('account',{ form : "partials/login.ejs" })
})

app.post('/login',async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let user = await consulta("Select * from Users where username like '"+username+"';");
    if(user.length == 0){
        console.log('EL nombre de usuario es incorrecto')
        res.redirect('/register')
    }else{
        if(encriptar(password) == user[0].password){
            req.session.user = username;
            req.session.user_id = user[0].user_id;
            res.redirect('/')
        }else{
            res.redirect('/register')
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
    if(users.length != 0){
        res.redirect('/register')
    }
    if(emaìls.length != 0){
        res.redirect('/register')
    }
    let register_user = await consulta("Insert into Users (username,email,password,birth_date) values ('"+username+"','"+email+"','"+password+"','"+birth_date+"');");
    res.redirect('/login')
})

app.get('/logout',auth_destroy,(req, res) => {
    res.redirect('/login')
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