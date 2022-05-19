import {consulta} from './mysqlConector.js';
import {conection} from './apiConector.js'
async function getAbbreviation(){
    let coins = []
    let query = await consulta("select exchange, pair from Coins order by coin_id;")
    for(let i=0; i != query.length; i++){
        coins.push([query[i]['exchange'],query[i]['pair']])
    }
    return coins
}

async function getCoinID(){
    let coins_id = []
    let datos = await consulta("select coin_id from Coins order by coin_id;")
    for(let i=0; i != datos.length; i++){
        coins_id.push(datos[i]['coin_id'])
    }
    return coins_id
}
async function getPortfolioID(){
    let portfolio_id = []
    let datos = await consulta("select portfolio_id from portfolios;")
    for(let i=0; i != datos.length; i++){
        portfolio_id.push(datos[i]['portfolio_id'])
    }
    return portfolio_id
}

async function getPrices(){
    let coins_historicals = []
    let datos = await consulta("select coin_id, prices from Historicals where range_days = 1 order by coin_id;")
    for(let i=0; i != datos.length; i++){
        if(datos[i]['coin_id'] != undefined){
            coins_historicals.push([datos[i]['coin_id'],datos[i]['prices']])
        }
    }
    return coins_historicals
}

async function getPrices_7days(){
    let coins_historicals = []
    let datos = await consulta("select coin_id, prices from Historicals where range_days = 7 order by coin_id;")
    for(let i=0; i != datos.length; i++){
        if(datos[i]['coin_id'] != undefined){
            coins_historicals.push([datos[i]['coin_id'],datos[i]['prices']])
        }
    }
    return coins_historicals
}

function getDatetime(){
    let current_date;
    let now = new Date()
    now.setHours(now.getHours()+2); 
    now = now.toISOString().split('T');
    current_date = now[0] +' '+ now[1].split('Z')[0]
    return current_date
}

async function getPrice(){
    let market_data = {
        'X-CW-API-Key': 'N2W10S4ODY0VXI716L8N'
    }
    let coins_price = []
    let current_date;
    let coins = await getAbbreviation()
    let coins_historicals = await getPrices()
    for(let i = 0; i != coins.length;i++){
        let url = "https://api.cryptowat.ch/markets/"+coins[i][0]+"/"+coins[i][1]+"/summary"
        let precio = await conection(url,market_data)
        let percent_change = precio.result.price.change.percentage * 100
        current_date = getDatetime()
        coins_price.push([coins[i][1], precio.result.price.last, percent_change, precio.result.volumeQuote, current_date])
    }
    for(let e=0; e != coins_price.length; e++){
        let prices = await consulta("UPDATE Coins SET price = "+coins_price[e][1]+", percent_change_24h = "+coins_price[e][2]+", volume_24h = "+coins_price[e][3]+", last_updated = '"+coins_price[e][4]+"' WHERE pair like '"+coins_price[e][0]+"';")
    }
    for(let y=0; y != (coins_historicals.length); y++){
        let a = coins_historicals[y][1]
        if(a == undefined){
            current_date = getDatetime()
            let prices_data = {
                [current_date]:  coins_historicals[y][1]
            }
            let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_data)+"' where coin_id = "+coins_historicals[y][0]+" and range_days = 1;")
        }else{
            current_date = getDatetime()
            let prices_json = JSON.parse(a)
            let keys = Object.keys(prices_json);
            let values = Object.values(prices_json);
            if(keys.length >= 288){
                let num = keys.length - 289;
                let lista_keys = keys.slice(num,keys.length)
                let lista_values = values.slice(num,keys.length)
                let json_prices = {};
                for(let i=0; i != lista_keys.length; i++){
                    json_prices[lista_keys[i]] = lista_values[i]
                }
                prices_json = json_prices
            }
            prices_json[current_date] = coins_price[y][1]
            let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_json)+"' where coin_id = "+coins_historicals[y][0]+" and range_days = 1;")
        }
    }
}
async function getPrice_7days(){
    let market_data = {
        'X-CW-API-Key': 'N2W10S4ODY0VXI716L8N'
    }
    let coins = await getAbbreviation()
    let coins_id = await getCoinID()
    let coins_historicals = await getPrices_7days()
    let current_date;
    let coins_price = []
    for(let i = 0; i != coins.length;i++){
        let url = "https://api.cryptowat.ch/markets/"+coins[i][0]+"/"+coins[i][1]+"/summary"
        let precio = await conection(url,market_data)
        coins_price.push([coins_id[i],precio.result.price.last])
    }
    for(let i = 0; i != coins_historicals.length;i++){
        if(coins_historicals[i][1] == undefined){
            current_date = getDatetime()
            let prices_data = {
                [current_date]:  coins_price[i][1]
            }
            let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_data)+"' where coin_id = "+coins_historicals[i][0]+" and range_days = 7;")
        }else{
            let prices_json = JSON.parse(coins_historicals[i][1])
            let keys = Object.keys(prices_json);
            let values = Object.values(prices_json);
            if(keys.length == 672){
                let num = keys.length - 673;
                let lista_keys = keys.slice(num,keys.length)
                let lista_values = values.slice(num,keys.length)
                let json_prices = {};
                for(let y=0; y != lista_keys.length; y++){
                    json_prices[lista_keys[y]] = lista_values[y]
                }
                prices_json = json_prices
            }
            current_date = getDatetime()
            prices_json[current_date] = coins_price[i][1]
            let prices = await consulta("UPDATE Historicals SET prices = '"+JSON.stringify(prices_json)+"' where coin_id = "+coins_historicals[i][0]+" and range_days = 7;")
        }
        
    }
}

async function getDataCoin(){
    let coin_id = await getCoinID()
    let coin_market_cap = {
        'X-CMC_PRO_API_KEY': '41282c59-9765-43a1-8754-447f88ed4f5c'
    }
    let coins_data = []
    let current_date;
    for(let i = 0; i != coin_id.length;i++){
        let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id="+coin_id[i]
        let precio = await conection(url,coin_market_cap)
        current_date = getDatetime()
        coins_data.push([coin_id[i],precio.data[coin_id[i]].circulating_supply,precio.data[coin_id[i]].max_supply,precio.data[coin_id[i]].quote.USD.market_cap,precio.data[coin_id[i]].quote.USD.market_cap_dominance,precio.data[coin_id[i]].total_supply,current_date,precio.data[coin_id[i]].quote.USD.volume_change_24h])
    }

    for(let i=0; i != coins_data.length; i++){
        let prices = await consulta("UPDATE Coins SET circulating_supply = "+coins_data[i][1]+", max_supply = "+coins_data[i][2]+", market_cap = "+coins_data[i][3]+", market_cap_dominance = "+coins_data[i][4]+", total_supply = "+coins_data[i][5]+",volume_change_24h = "+coins_data[i][7]+", last_updated = '"+coins_data[i][6]+"' WHERE coin_id = "+coins_data[i][0]+";")
    }
}

async function getPortfolioPrices(){
    let portfolio_prices = {}
    let datos = await consulta("select portfolio_id, prices from historicals_portfolio where range_days = 1;")
    for(let i=0; i != datos.length; i++){
        portfolio_prices[datos[i]['portfolio_id']] = datos[i]['prices']
    }
    return portfolio_prices

}

async function getPortfolioPrices_7days(){
    let portfolio_prices = {}
    let datos = await consulta("select portfolio_id, prices from historicals_portfolio where range_days = 7;")
    for(let i=0; i != datos.length; i++){
        portfolio_prices[datos[i]['portfolio_id']] = datos[i]['prices']
    }
    return portfolio_prices

}

async function updatePortfolio(){
    let portfolio_id = await getPortfolioID();
    let coins = await consulta("select coin_id, price from coins");
    let coins_price = {}
    let current_date;
    let portfolio_price = await getPortfolioPrices()
    for(let i=0; i != coins.length; i++){
        coins_price[coins[i].coin_id] = coins[i].price
    }
    
    for(let i=0; i != portfolio_id.length; i++){
        let assets = await consulta("select coin_id, amount from assets where portfolio_id = "+portfolio_id[i]);
        if (assets.length != 0){
            let precio_total = 0;
            for(let e=0; e != assets.length; e++){
                precio_total += coins_price[assets[e].coin_id] * assets[e].amount
            }
            if(portfolio_price[portfolio_id[i]] == null){
                current_date = getDatetime()
                let prices_data = {
                    [current_date]:  precio_total
                }
                let prices = await consulta("UPDATE historicals_portfolio set prices = '"+JSON.stringify(prices_data)+"' where portfolio_id = "+portfolio_id[i]+" and range_days = 1");
            }else{
                let prices_data = JSON.parse(portfolio_price[portfolio_id[i]])
                let keys = Object.keys(prices_data);
                let values = Object.values(prices_data);
                if(keys.length >= 288){
                    let num = keys.length - 289;
                    let lista_keys = keys.slice(num,keys.length)
                    let lista_values = values.slice(num,keys.length)
                    let json_prices = {};
                    for(let y=0; y != lista_keys.length; y++){
                        json_prices[lista_keys[y]] = lista_values[y]
                    }
                    prices_data = json_prices
                }
                current_date = getDatetime()
                prices_data[current_date] = precio_total
                let prices = await consulta("UPDATE historicals_portfolio set prices = '"+JSON.stringify(prices_data)+"' where portfolio_id = "+portfolio_id[i]+" and range_days = 1");
            }
        }
    }
}
async function updatePortfolio_7days(){
    let portfolio_id = await getPortfolioID();
    let coins = await consulta("select coin_id, price from coins");
    let coins_price = {}
    let current_date;
    let portfolio_price = await getPortfolioPrices_7days()
    for(let i=0; i != coins.length; i++){
        coins_price[coins[i].coin_id] = coins[i].price
    }
    
    for(let i=0; i != portfolio_id.length; i++){
        let assets = await consulta("select coin_id, amount from assets where portfolio_id = "+portfolio_id[i]);
        if (assets.length != 0){
            let precio_total = 0;
            for(let e=0; e != assets.length; e++){
                precio_total += coins_price[assets[e].coin_id] * assets[e].amount
            }
            if(portfolio_price[portfolio_id[i]] == null){
                current_date = getDatetime()
                let prices_data = {
                    [current_date]:  precio_total
                }
                let prices = await consulta("UPDATE historicals_portfolio set prices = '"+JSON.stringify(prices_data)+"' where portfolio_id = "+portfolio_id[i]+" and range_days = 7");
            }else{
                let prices_data = JSON.parse(portfolio_price[portfolio_id[i]])
                let keys = Object.keys(prices_data);
                let values = Object.values(prices_data);
                if(keys.length == 672){
                    let num = keys.length - 673;
                    let lista_keys = keys.slice(num,keys.length)
                    let lista_values = values.slice(num,keys.length)
                    let json_prices = {};
                    for(let y=0; y != lista_keys.length; y++){
                        json_prices[lista_keys[y]] = lista_values[y]
                    }
                    prices_data = json_prices

                }
                current_date = getDatetime()
                prices_data[current_date] = precio_total
                let prices = await consulta("UPDATE historicals_portfolio set prices = '"+JSON.stringify(prices_data)+"' where portfolio_id = "+portfolio_id[i]+" and range_days = 7");
            }
        }
    }
}

export{
    getPrices,
    getPrice,
    getDataCoin,
    getPrice_7days,
    updatePortfolio,
    updatePortfolio_7days
}