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
        if(a == undefined){
        current_date = getDatetime()
        let prices_data = {
            [current_date]:  coins_price[y][1]
        }
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_data)+"' where coin_id = "+coins_historicals[y][0]+" and range = 1;")
        }else{
        current_date = getDatetime()
        let prices_json = JSON.parse(a)
        prices_json[current_date] = coins_price[y][1]
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_json)+"' where coin_id = "+coins_historicals[y][0]+" and range = 1;")
        }
    }
}
async function getRange(){
    let coins_historicals = await getPrices()
    let datos = await getAbbreviation()
    let coins_price = []
    let current_date;

    for(let i = 0; i != datos.length;i++){
        let url = "https://api.cryptowat.ch/markets/"+datos[i][0]+"/"+datos[i][1]+"/summary"
        let precio = await conection(url,market_data)
        current_date = getDatetime()
        coins_price.push([datos[i][1], precio.result.price.last,current_date])
    }

    for(let y=0; y != coins_historicals.length; y++){
        let a = coins_historicals[y][1]
        if(a == undefined){
        current_date = getDatetime()
        let prices_data = {
            [current_date]:  coins_price[y][1]
        }
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_data)+"' where coin_id = "+coins_historicals[y][0]+" and range = 7;")
        }else{
        current_date = getDatetime()
        let prices_json = JSON.parse(a)
        prices_json[current_date] = coins_price[y][1]
        let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_json)+"' where coin_id = "+coins_historicals[y][0]+" and range = 7;")
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

export{
    getPrice,
    getRange,
    getDataCoin
}