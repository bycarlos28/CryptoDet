$( document ).ready(function() {
    $('#enviar').click(function(event) {
        if (validar_passwords() == true){
            console.log('hola')
        }else{
            $('#form').append('<div id="msg_password"><p>Passwords do not match</p></div>')
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
                $("#searcher").attr('action',"/coin/"+value);
            } catch (err) {}
        },
        select: function( event, ui ) {
            try{
                value =ui.item.value.split("(")[1].slice(0,-1).toLowerCase()
                $("#searcher").attr('action',"/coin/"+value);
            } catch (err) {}
        }
    });
    $( "#input_searcher" ).on("input", function() {
        try{
            value =$("#input_searcher").val().split("(")[1].slice(0,-1).toLowerCase()
            $("#searcher").attr('action',"/coin/"+value);
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
    spawnFeedbackBox("info", "Address copied")
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
            $("#buttonfavstar").attr("onclick", "addfav(" + coin_id + ", " + user_id + ")")
        } catch (err) {}
    }
    spawnFeedbackBox("success", "Coin deleted from favourites")
}

async function addfav(favid, userid) {  
    if(userid != ""){
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
      const td2 = $("<td>").append($("<a>").attr("href", "/coin/"+coin_abbreviation.toLowerCase()).append($("<p>").text(coin_name + " ($" + coin_abbreviation + ")")))
      const tr = $("<tr>").attr("id", tagId).append(td1).append(td2)
      $("#favtable").append(tr)
      try {
          $("#favstar").attr("src", "/img/fullstar.png")
          $("#buttonfavstar").attr("onclick", "deletefav('"+favourite_id+"', true)")
      } catch (err) {}
      spawnFeedbackBox("success", coin_name+" added to favourites")
    }
}

async function createPortfolio(user_id) {
    const newname= $("#newPortfolioName").val()
    let portfolio_id
    let query = 'INSERT INTO portfolios (user_id, name) VALUES ('+user_id+',"'+newname+'");'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            portfolio_id = result.insertId; //this will alert you the last_id
        }
    });
    query = 'INSERT INTO historicals_portfolio (portfolio_id, range_days) VALUES ('+portfolio_id+', 1)'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'INSERT INTO historicals_portfolio (portfolio_id, range_days) VALUES ('+portfolio_id+', 7)'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    window.location="/portfolio/"+portfolio_id
    spawnFeedbackBox("success", "Portfolio " +newname+" has been created")
}

async function deletePortfolio(portfolio_id, user_id) {
    const id = parseInt(portfolio_id)
    let redirectedPortfolio
    let query = 'DELETE FROM transactions WHERE portfolio_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'DELETE FROM historicals_portfolio WHERE portfolio_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'DELETE FROM assets WHERE portfolio_id='+id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'DELETE FROM portfolios WHERE portfolio_id='+id+';'
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
    window.location="/portfolio/"+redirectedPortfolio
    spawnFeedbackBox("success", "Portfolio deleted")
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
                        spawnFeedbackBox("error", "You don't have " + coin_name + " ($"+coin_abb+") to sell.")
                    } else {
                        spawnFeedbackBox("error", "You don't have enough " + coin_name + " ($"+coin_abb+") to sell.")
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
                        window.location="/portfolio/"+portfolio_id
                        if (tx_type== "buy") {
                            spawnFeedbackBox("Success", "The purchase of " + coin_name + " ($"+coin_abb+") has been registered.")
                        } else if (tx_type=="sell") {
                            spawnFeedbackBox("Success", "The sale of " + coin_name + " ($"+coin_abb+") has been registered.")
                        }
                    }
                });
            }
        }
    });

}

async function deleteAsset(portfolio_id, coin_id, asset_id) {
    query = 'DELETE FROM transactions WHERE coin_id='+coin_id+' and portfolio_id='+portfolio_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });
    query = 'DELETE FROM assets WHERE assets_id='+asset_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            window.location="/portfolio/"+portfolio_id
            spawnFeedbackBox("Success", "Asset deleted.")
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
    });
    query = 'DELETE FROM transactions WHERE transaction_id='+transaction_id+';'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
        success: function(result){
            spawnFeedbackBox("Success", "Transaction deleted.")
            $("#tr_tx_"+transaction_id).remove()
            // window.location="/portfolio/"+portfolio_id // better delete the row and not redirect the url
        }
    });
}

function treatNumber(num, element_id, extra) {
    num = parseInt(num)
    var numTreated = ""
    if (num > 1000000000000) {
        numTreated = num.toFixed(0).toString().slice(0,-12) + "." + num.toFixed(0).toString().slice(-12,-10) + "T"
    } else if (num > 1000000000) {
        numTreated = num.toFixed(0).toString().slice(0,-9) + "." + num.toFixed(0).toString().slice(-9,-7) + "B"
    } else if (num > 1000000) {
        numTreated = num.toFixed(0).toString().slice(0,-6) + "." + num.toFixed(0).toString().slice(-6,-4)  + "M"
    } else {
        numTreated = num.toFixed(2)
    }
    $(element_id).append('span').text(numTreated+extra);
}

function spawnFeedbackBox(type, text) {
    $("#alertFeedback").empty()
    $("#alertFeedback").fadeTo(750, 1);
    if (type=="error") {
        $("#alertFeedback").attr("class", "absolute left-0 right-0 mx-auto rounded-lg bg-red-600 w-[20%] mt-[160px] flex justify-between py-[5px]").append("<div class='flex items-center'><span class='font-bold ml-[20px] mr-[10px]'>Error:</span><span>"+text+"</span></div><span class='text-xl font-bold mr-[10px] mb-[5px] hover:cursor-pointer' onclick='hideAlertFeedback()'>&times;</span>")
    } else if (type=="success") {
        $("#alertFeedback").attr("class", "absolute left-0 right-0 mx-auto rounded-lg bg-lime-600 w-[20%] mt-[160px] flex justify-between py-[5px]").append("<div class='flex items-center'><span class='font-bold ml-[20px] mr-[10px]'>Success:</span><span>"+text+"</span></div><span class='text-xl font-bold mr-[10px] mb-[5px] hover:cursor-pointer' onclick='hideAlertFeedback()'>&times;</span>")
    } else if (type=="warning") {
        $("#alertFeedback").attr("class", "absolute left-0 right-0 mx-auto rounded-lg bg-yellow-500 w-[20%] mt-[160px] flex justify-between py-[5px]").append("<div class='flex items-center'><span class='font-bold ml-[20px] mr-[10px]'>Warning:</span><span>"+text+"</span></div><span class='text-xl font-bold mr-[10px] mb-[5px] hover:cursor-pointer' onclick='hideAlertFeedback()'>&times;</span>")
    } else if (type=="info") {
        $("#alertFeedback").attr("class", "absolute left-0 right-0 mx-auto rounded-lg bg-sky-600 w-[20%] mt-[160px] flex justify-between py-[5px]").append("<div class='flex items-center'><span class='font-bold ml-[20px] mr-[10px]'>Info:</span><span>"+text+"</span></div><span class='text-xl font-bold mr-[10px] mb-[5px] hover:cursor-pointer' onclick='hideAlertFeedback()'>&times;</span>")
    }
    $("#alertFeedback").effect("shake", {distance:5, times:2})
}

function hideAlertFeedback() {
    $("#alertFeedback").fadeTo(750, 0);
}

async function addCoin(contracts,socials) {
    const coin_name = $('input[name="coin_name"]').val()
    const coin_abbreviation = $('input[name="coin_abbreviation"]').val()
    const coin_description = $('input[name="coin_description"]').val()
    
    const api_coin_id= $('input[name="api_coin_id"]').val() 
    const coin_exchange= $('input[name="coin_exchange"]').val() 
    const coin_pair= $('input[name="coin_pair"]').val() 


    let network, token_address, type, platform, url
    let query = 'INSERT INTO coins (coin_id, name, exchange, pair, abbreviation, description, circulating_supply, total_supply, max_supply, price, volume_24h, volume_change_24h, percent_change_24h, market_cap, market_cap_dominance) VALUES ('+api_coin_id+', "'+coin_name+'", "'+coin_exchange+'","'+coin_pair+'", "'+coin_abbreviation+'", "'+coin_description+'", 0, 0, 0, 0, 0, 0, 0, 0, 0);'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });

    query = 'INSERT INTO historicals (coin_id, range_days) VALUES ('+api_coin_id+',1) , ('+api_coin_id+',7);'
    await $.ajax({
        url: "/consulta/"+query,
        method: "GET",
    });

    for (var i = 1; i <= contracts; i++) {
        network=$('input[name="network_'+i+'"]').val()
        token_address = $('input[name="token_address_'+i+'"]').val()
        query= 'INSERT INTO contracts (platform, coin_id, token_address) VALUES ("'+network+'", '+api_coin_id+',"'+token_address+'");'
        await $.ajax({
            url: "/consulta/"+query,
            method: "GET",
        });
    }

    for (var i = 1; i <= socials; i++) {
        type= $('input[name="type_'+i+'"]').val()
        platform = $('input[name="platform_'+i+'"]').val()
        url = $('input[name="url_'+i+'"]').val()
        query= 'INSERT INTO socials (coin_id, type, platform, url) VALUES ('+api_coin_id+', "'+type+'", "'+platform+'", "'+url+'");'
        console.log(query)
        await $.ajax({
            url: "/consulta/"+query,
            method: "GET",
            success: function(result){
                console.log(result)
                spawnFeedbackBox("Success",  coin_name+" added to Database.")
                //window.location="/admin/add"
            }
        });
    }
    window.location="/admin/add"
    spawnFeedbackBox("success", coin_name+" ($"+coin_abbreviation+") added to the Database.")
}

function addContractField(contracts, socials) {
    $("#deleteContract_"+contracts).remove()
    contracts+=1
    $("#contract_"+(contracts-1)).append(($("<div>").attr("id", "contract_"+contracts)).html('<div class="border-t-[1px] flex pt-[10px]">'+
                                                                                            '<p class="text-lg mr-[15px]">Network:</p>'+
                                                                                            '<input required class="pl-[15px] border-[1px]" type="text" name="network_'+contracts+'">'+
                                                                                        '</div>'+
                                                                                        '<div class="flex my-[10px]">'+
                                                                                            '<p class="text-lg mr-[15px]">Token Address:</p>'+
                                                                                            '<input id="lastInputContract_'+contracts+'" required class="pl-[15px] border-[1px]" type="text" name="token_address_'+contracts+'">'+
                                                                                            '<p id="deleteContract_'+contracts+'" onclick="deleteContractField('+contracts+')"><img src="/img/delete.png" class="rounded-xl p-[4px] pt-[2px] bg-[#d11514] max-w-[10xp] max-h-[25px] mt-[3px] ml-[35px] hover:cursor-pointer"></p>'+
                                                                                            '</div>'
    ))
    $('#addCoinButton').attr("onclick", "addCoin("+contracts+","+socials+")")
    $('#addContractFieldButton').attr("onclick", "addContractField("+contracts+","+socials+")")
    $('#addSocialFieldButton').attr("onclick", "addSocialField("+contracts+","+socials+")")
}

function addSocialField(contracts, socials) {
    $("#deleteSocial_"+socials).remove()
    socials+=1
    $("#social_"+(socials-1)).append(($("<div>").attr("id", "social_"+socials)).html('<div class="border-t-[1px] flex pt-[10px]">'+
                                                                                '<p class="text-lg mr-[15px]">Type:</p>'+
                                                                                '<input required class="pl-[15px] border-[1px]" type="text" name="type_'+socials+'">'+
                                                                            '</div>'+
                                                                            '<div class="flex mt-[10px]">'+
                                                                                '<p class="text-lg mr-[15px]">Platform:</p>'+
                                                                                '<input required class="pl-[15px] border-[1px]" type="text" name="platform_'+socials+'">'+
                                                                                '</div>'+
                                                                            '<div class="flex my-[10px]">'+
                                                                                '<p class="text-lg mr-[15px]">URL:</p>'+
                                                                                '<input id="lastInputSocial_'+socials+'" required class="pl-[15px] border-[1px]" type="text" name="url_'+socials+'">'+
                                                                                '<p id="deleteSocial_'+socials+'" onclick="deleteSocialField('+socials+')"><img src="/img/delete.png" class="rounded-xl p-[4px] pt-[2px] bg-[#d11514] max-w-[10xp] max-h-[25px] mt-[3px] ml-[35px] hover:cursor-pointer"></p>'+
                                                                            '</div>'
    ))
    $('#addCoinButton').attr("onclick", "addCoin("+contracts+","+socials+")")
    $('#addContractFieldButton').attr("onclick", "addContractField("+contracts+","+socials+")")
    $('#addSocialFieldButton').attr("onclick", "addSocialField("+contracts+","+socials+")")
}

function deleteContractField(idToDelete) {
    $("#contract_"+idToDelete).remove()
    $("<p>").attr("id","deleteContract_"+(idToDelete-1)).attr("onclick", "deleteContractField("+(idToDelete-1)+")").append($("<img>").attr("src","/img/delete.png").attr("class","rounded-xl p-[4px] pt-[2px] bg-[#d11514] max-w-[10xp] max-h-[25px] mt-[3px] ml-[35px] hover:cursor-pointer")).insertAfter($("#lastInputContract_"+(idToDelete-1)))
    newContracts= parseInt($("#addCoinButton").attr("onclick").slice(-4,-3)-1)
    socials= $("#addCoinButton").attr("onclick").slice(-2,-1)
    $('#addCoinButton').attr("onclick", "addCoin("+newContracts+","+socials+")")
    $('#addContractFieldButton').attr("onclick", "addContractField("+newContracts+","+socials+")")
    $('#addSocialFieldButton').attr("onclick", "addSocialField("+newContracts+","+socials+")")
}

function deleteSocialField(idToDelete) {
    $("#social_"+idToDelete).remove()
    $("<p>").attr("id","deleteSocial_"+(idToDelete-1)).attr("onclick", "deleteSocialField("+(idToDelete-1)+")").append($("<img>").attr("src","/img/delete.png").attr("class","rounded-xl p-[4px] pt-[2px] bg-[#d11514] max-w-[10xp] max-h-[25px] mt-[3px] ml-[35px] hover:cursor-pointer")).insertAfter($("#lastInputSocial_"+(idToDelete-1)))
    contracts= $("#addCoinButton").attr("onclick").slice(-4,-3)
    newSocials= parseInt($("#addCoinButton").attr("onclick").slice(-2,-1))-1
    $('#addCoinButton').attr("onclick", "addCoin("+contracts+","+newSocials+")")
    $('#addContractFieldButton').attr("onclick", "addContractField("+contracts+","+newSocials+")")
    $('#addSocialFieldButton').attr("onclick", "addSocialField("+contracts+","+newSocials+")")
}