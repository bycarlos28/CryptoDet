$( document ).ready(function() {
    $('#enviar').click(function(event) {
        if (validar_passwords() == true){
            console.log('hola')
        }else{
            $('#form').append('<div id="msg_password"><p>Las Contraseñas no coinciden </p></div>')
            event.preventDefault()
        }
    });
    // Do a query in coin that return list of <name (abbreviation)>s    
    const query = 'SELECT name, abbreviation FROM coins;'
    var availableTags = []
    $.ajax({
        url: "/consulta/"+query,
        method: "GET"
    }).done(function(data){
        for(let i=0; i != data.length; i++){
            availableTags.push(data[i]["name"] + " (" + data[i]["abbreviation"] + ")")
        }
        })
    $( "#input_searcher" ).autocomplete({
        autoFocus: true,
        source: availableTags,
        change: function( event, ui ) {
            try{
                let value = ui.item.value.split("(")[1].slice(0,-1).toLowerCase()
                $("#searcher").attr('action',"../coin/"+value);
            } catch (err) {}
        },
        select: function( event, ui ) {
            try{
                value =ui.item.value.split("(")[1].slice(0,-1).toLowerCase()
                $("#searcher").attr('action',"../coin/"+value);
            } catch (err) {}
        }
    });
    $( "#input_searcher" ).on("input", function() {
        try{
            value =$("#input_searcher").val().split("(")[1].slice(0,-1).toLowerCase()
            $("#searcher").attr('action',"../coin/"+value);
        } catch (err) {}
    });
});

function validar_passwords(){
    let password = $('#password').val();
    let password2 = $('#password2').val();
    return password == password2
}

function copyElementText(id) {
    var text = document.getElementById(id).innerText;
    var elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = text;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
}

async function deletefav(favid, currentPage) {
    const id = parseInt(favid)
    const tagId = '#fav_'+id.toString()
    let coin_id
    let user_id
    let query = 'SELECT * FROM favourites WHERE favourites_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            coin_id = result[0].coin_id;
            user_id = result[0].user_id;
        }
    });
    query = 'DELETE FROM favourites WHERE favourites_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET"
    });
    $(tagId).remove()
    if (currentPage) {
        try {
            $("#favstar").attr("src", "/img/emptystar.png")
            $("#buttonfavstar").attr("onclick", "addfav('" + coin_id + ", " + user_id + "')")
        } catch (err) {}
    }
}

async function addfav(favid, userid) {
    const id = parseInt(favid)
    let coin_id
    let coin_name
    let coin_abbreviation
    let favourite_id
    let query = 'INSERT INTO favourites (user_id, coin_id) VALUES ('+userid+','+id+');'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            favourite_id = result.insertId;
        }
    });
    const tagId = 'fav_'+favourite_id.toString()
    query = 'SELECT * FROM coins WHERE coin_id = '+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET"
    }).done(function(data){
        coin_id = data[0].coin_id
        coin_name = data[0].name
        coin_abbreviation = data[0].abbreviation
    });

    // Creating the new row on favourites's table
    const image = $("<img>").attr("src", "/img/fullstar.png").attr("class", "max-w-[15px] max-h-[15px]")
    const button = $("<button>").attr("onclick", "deletefav('"+favourite_id+"', true)").append(image)
    const td1= $("<td>").attr("class", "text-center").append(button)
    const td2 = $("<td>").append($("<a>").attr("href", "../coin/"+coin_abbreviation.toLowerCase()).append($("<p>").text(coin_name + " ($" + coin_abbreviation + ")")))
    const tr = $("<tr>").attr("id", tagId).append(td1).append(td2)
    $("#favtable").append(tr)
    try {
        $("#favstar").attr("src", "/img/fullstar.png")
        $("#buttonfavstar").attr("onclick", "deletefav('"+favourite_id+"', true)")
    } catch (err) {}
}

async function createPortfolio(user_id) {
    const newname= $("#newPortfolioName").val()
    let portfolio_id
    const query = 'INSERT INTO portfolios (user_id, name) VALUES ('+user_id+',"'+newname+'");'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            portfolio_id = result.insertId; //this will alert you the last_id
        }
    });
    window.location="../portfolio/"+portfolio_id
}

async function deletePortfolio(portfolio_id, user_id) {
    const id = parseInt(portfolio_id)
    let redirectedPortfolio
    let query2 = 'DELETE FROM transactions WHERE portfolio_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query2,
        method: "GET",
    });
    let query = 'DELETE FROM portfolios WHERE portfolio_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'SELECT portfolio_id FROM portfolios WHERE user_id ='+user_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET"
    }).done(function(data){
        redirectedPortfolio = data[0].portfolio_id
    });
    window.location="../portfolio/"+redirectedPortfolio
}

async function addAsset(id){
    const portfolio_id = parseInt(id)
    const coin_id = parseInt($('#input_asset').val())
    const quantity = parseFloat($('#asset_quantity').val())
    const pxc = parseFloat($('#asset_pxc').val())
    const spended = (quantity*pxc).toFixed(2)
    const tx_timestamp = $('#transaction_timestamp').val()
    const tx_type = document.querySelector('input[name="transaction_type"]:checked').value
    let valid_tx = false

    query = 'SELECT * FROM assets WHERE portfolio_id='+id+' and coin_id='+coin_id+''
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: async function(result){
            if (tx_type == "buy") {
                if (result.length == 0) {
                    query = 'INSERT INTO assets (portfolio_id, coin_id, amount, spended) VALUES ('+ portfolio_id + ', ' + coin_id + ', ' + quantity + ", " + spended + ");"
                    await $.ajax({
                        url: "/consulta/"+query,
                        method: "GET",
                    });
                } else {
                    totalAmount = result[0].amount + quantity
                    totalSpended = result[0].spended + spended
                    query = 'UPDATE assets SET amount='+totalAmount+', spended='+totalSpended+' WHERE assets_id='+result[0].assets_id+';'
                    await $.ajax({
                        url: "/consulta/"+query,
                        method: "GET",
                    });
                }
                valid_tx = true
            } else {
                if (result.length == 0 || result[0].amount < quantity) {
                    query = 'SELECT name, abbreviation FROM coins WHERE coin_id='+coin_id+';'
                    await $.ajax({
                        url: "/consulta/"+query,
                        method: "GET",
                        success: function(result){
                            coin_name = result[0].name;
                            coin_abb = result[0].abbreviation
                        }
                    });
                    if (result.length == 0) {
                        alert("No tienes ningún "+coin_name+" ($" + coin_abb +") para vender!")
                    } else {
                        alert("Estás intentando vender más "+coin_name+" ($" + coin_abb +") de los que tienes!")
                    }
                } else {
                    totalAmount = result[0].amount - quantity
                    totalSpended = result[0].spended - spended
                    query = 'UPDATE assets SET amount='+totalAmount+', spended='+totalSpended+' WHERE assets_id='+result[0].assets_id+';'
                    await $.ajax({
                        url: "/consulta/"+query,
                        method: "GET",
                    });
                    valid_tx = true
                }
            }
            if (valid_tx == true) {
                query = 'INSERT INTO transactions (type, portfolio_id, coin_id, asset_price, tx_date, tx_amount) VALUES ("'+tx_type+'", '+ portfolio_id + ', '+coin_id+','+pxc+',"'+tx_timestamp+'",'+quantity+');'
                await $.ajax({
                    url: "/consulta/"+query,
                    method: "GET",
                    success: function(result){
                        alert("Transaction ID: " + result.insertId)
                        window.location="../portfolio/"+portfolio_id
                    }
                });
            }
        }
    });

}

async function deleteAsset(portfolio_id, coin_id, asset_id) {
    query = 'DELETE FROM transactions WHERE coin_id='+coin_id+' and portfolio_id='+portfolio_id+';'
    await $.ajax({
        url: "consulta/"+query,
        method: "GET",
        success: function(result){
            console.log("All transactions from coin: " +coin_id+ " have been deleted.")
        }
    });
    query = 'DELETE FROM assets WHERE assets_id='+asset_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            alert("Asset deleted successfully")
            window.location="../portfolio/"+portfolio_id
        }
    });
}

async function deleteTransaction(portfolio_id, coin_id, transaction_id, tx_type) {
    let transaction_data
    let asset_data
    query = 'SELECT * FROM transactions WHERE transaction_id='+transaction_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            transaction_data=result[0]
        }
    });
    query = 'SELECT * FROM assets WHERE portfolio_id='+portfolio_id+' and coin_id='+coin_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            asset_data=result[0]
        }
    });
    let totalAmount
    let totalSpended
    if (tx_type == "buy") {
        totalAmount = asset_data.amount-(transaction_data.tx_amount)
        totalSpended = asset_data.spended-((transaction_data.tx_amount*transaction_data.asset_price).toFixed(2))
    } else if (tx_type == "sell") {
        totalAmount = asset_data.amount+(transaction_data.tx_amount)
        totalSpended = asset_data.spended+((transaction_data.tx_amount*transaction_data.asset_price).toFixed(2))
    }
    query = 'UPDATE assets SET amount='+totalAmount+', spended='+totalSpended+' WHERE portfolio_id='+portfolio_id+' and coin_id='+coin_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            alert("Asset updated successfully")
        }
    });
    query = 'DELETE FROM transactions WHERE transaction_id='+transaction_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            alert("Transaction deleted successfully")
            window.location="../portfolio/"+portfolio_id // better delete the row and not redirect the url
        }
    });
}