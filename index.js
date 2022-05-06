import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import {conection} from './public/javascripts/apiConector.js'
import {encriptar,desencriptar} from './public/javascripts/encriptar.js'
import {consulta} from './public/javascripts/mysqlConector.js';

const app = express();
const port = 3001
const __dirname = path.resolve();

async function getAbbreviation(){
    let coins = []
    let datos = await consulta("select * from Coins;")
    for(let i=0; i != datos.length; i++){
        coins.push([datos[i]['exchange'],datos[i]['pair']])
    }
    return coins
}

async function getCoinID(){
    let coins_id = []
    let datos = await consulta("select coin_id from Coins;")
    for(let i=0; i != datos.length; i++){
        coins_id.push(datos[i]['coin_id'])
    }
    return coins_id
}

async function getPrices(){
    let coins_historicals = []
    let datos = await consulta("select coin_id, prices from Historicals;")
    for(let i=0; i != datos.length; i++){
        coins_historicals.push([datos[i]['coin_id'],datos[i]['prices']])
    }
    return coins_historicals
}


function getDatetime(){
    let current_date;
    let now = new Date().toISOString().split('T');
    current_date = now[0] +' '+ now[1].split('Z')[0]
    return current_date
}

async function getPrice(){
    let market_data = {
        'X-CW-API-Key': 'N2W10S4ODY0VXI716L8N'
    }
    let coins_price = []
    let current_date = getDatetime()
    let datos = await getAbbreviation()
    let coins_historicals = await getPrices()

    for(let i = 0; i != datos.length;i++){
        let url = "https://api.cryptowat.ch/markets/"+datos[i][0]+"/"+datos[i][1]+"/summary"
        let precio = await conection(url,market_data)
        let percent_change = precio.result.price.change.percentage * 100
        coins_price.push([datos[i][1], precio.result.price.last, percent_change, precio.result.volumeQuote, current_date])
    }
    for(let e=0; e != coins_price.length; e++){
        let prices = await consulta("UPDATE Coins SET price = "+coins_price[e][1]+", percent_change_24h = "+coins_price[e][2]+", volume_24h = "+coins_price[e][3]+", last_updated = '"+coins_price[e][4]+"' WHERE pair like '"+coins_price[e][0]+"';")
    }
    for(let y=0; y != coins_historicals.length; y++){
        let a = coins_historicals[y][1]
        if(a == ""){
        current_date = getDatetime()
        let prices_data = {
            [current_date]:  coins_price[y][1]
        }
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_data)+"' where coin_id = "+coins_historicals[y][0]+";")
        }else{
        current_date = getDatetime()
        let prices_json = JSON.parse(a)
        prices_json[current_date] = coins_price[y][1]
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_json)+"' where coin_id = "+coins_historicals[y][0]+";")
        }
    }
}
async function getDataCoin(){
    let coin_id = await getCoinID()
    let coin_market_cap = {
        'X-CMC_PRO_API_KEY': '41282c59-9765-43a1-8754-447f88ed4f5c'
    }
    coins_data = []
    for(let i = 0; i != coin_id.length;i++){
        let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id="+coin_id[i]
        let precio = await conection(url,coin_market_cap)
        coins_data.push([coin_id[i],precio.data[coin_id[i]].circulating_supply,precio.data[coin_id[i]].max_supply,precio.data[coin_id[i]].quote.USD.market_cap,precio.data[coin_id[i]].quote.USD.market_cap_dominance,precio.data[coin_id[i]].total_supply])
    }

    for(let i=0; i != coins_price.length; i++){
        let prices = await consulta("UPDATE Coins SET circulating_supply = "+coins_price[i][1]+", max_supply = "+coins_price[i][2]+", market_cap = "+coins_price[i][3]+", market_cap_dominance = "+coins_price[i][4]+", total_supply = "+coins_price[i][5]+" WHERE coin_id = "+coins_price[i][0]+";")
    }
}


cron.schedule("*/5 * * * *",async() =>{
    await getPrice()
})

cron.schedule("0 */12 * * *",async() =>{
    await getDataCoin()
})

app.use(bodyParser.urlencoded({extended: false}));
app.use('/static', express.static(__dirname + '/public'));
app.use('/js', express.static(path.join(__dirname, 'public/javascripts')))
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')))
app.use('/img', express.static(path.join(__dirname, 'public/images')))
app.set('view engine', 'ejs');

/*
app.get('/',(req, res) => {
    res.render('home')
})

app.get('/login',async(req, res) => {
    res.render('account',{ form : "partials/login.ejs" })
})

app.post('/login',async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let query = 'SELECT * FROM Users where username like "'+username+'";';
    let respon
})

app.get('/register',(req, res) => {
    res.render('account',{ form : "partials/register.ejs" })
})

app.post('/register:json',(req, res) => {
    let user_exist;
    let email_exist;
    let content = {}
    let json = JSON.parse(req.params.json)
    let sql = 'SELECT * FROM Users where username like "'+json['username']+'" or email like "'+json['mail']+'";';
    consulta(sql,(err,result) => {
        if(err) throw err
        if(result.length == 0){
        let insert = ('INSERT INTO Users (username, email,password,birth_date) VALUES ("'+json["username"]+'","'+json["email"]+'","'+json["password"]+'","'+json["birth_date"]+'");')
        consulta(insert,(err,result2) => {
            if(err) throw err
            res.redirect('/login')
        })
        }else{
        for(let i = 0; i != result.length; i++){
            if(result[i]['username'] == json['username']){
            user_exist = true
            }
            if(result[i]['email'] == json['email']){
            email_exist = true
            }
        }
        if(user_exist == true){
            
        }
        if(email_exist == true){

        }
        console.log(result[0])
        res.redirect('/register')
        }
    })
})

app.get('/logout',(req, res) => {
})

app.post('/logout',(req, res) => {
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
})*/

app.listen(port, () => {
  //console.log(`Example app listening on port ${port}`)
})