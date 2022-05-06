// var axios = require('axios')

$( document ).ready(function() {
    // Do a query in coin that return list of <name (abbreviation)>s    
    const query = 'SELECT name, abbreviation FROM coins;'
    var availableTags = []
    $.ajax({
        url: "http://localhost:3001/consulta/"+query,
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
    let query = 'SELECT * FROM favourites WHERE favourites_id='+id+';' //TODO insertar user_id y no "1"
    await $.ajax({
        url: "http://localhost:3001/consulta/"+query,
        method: "GET",
        success: function(result){
            coin_id = result[0].coin_id; //this will alert you the last_id
          }
    });
    query = 'DELETE FROM favourites WHERE favourites_id='+id+';'
    await $.ajax({
        url: "http://localhost:3001/consulta/"+query,
        method: "GET"
    });
    $(tagId).remove()
    if (currentPage) {
        try {
            $("#favstar").attr("src", "/img/emptystar.png")
            $("#buttonfavstar").attr("onclick", "addfav('" + coin_id + "')")
        } catch (err) {}
    }
}

async function addfav(favid) {
    const id = parseInt(favid)
    let coin_id
    let coin_name
    let coin_abbreviation
    let favourite_id
    let query = 'INSERT INTO favourites (user_id, coin_id) VALUES ('+1+','+id+');' //TODO insertar user_id y no "1"
    await $.ajax({
        url: "http://localhost:3001/consulta/"+query,
        method: "GET",
        success: function(result){
            favourite_id = result.insertId; //this will alert you the last_id
          }
    });
    const tagId = 'fav_'+favourite_id.toString()
    query = 'SELECT * FROM coins WHERE coin_id = '+id+';'
    await $.ajax({
        url: "http://localhost:3001/consulta/"+query,
        method: "GET"
    }).done(function(data){
        coin_id = data[0].coin_id
        coin_name = data[0].name
        coin_abbreviation = data[0].abbreviation
    });

    const image = $("<img>").attr("src", "/img/fullstar.png")
    image.attr("class", "max-w-[15px] max-h-[15px]")
    const button = $("<button>").attr("onclick", "deletefav('"+favourite_id+"', true)").append(image)
    const td1= $("<td>").attr("class", "text-center").append(button)
    const td2 = $("<td>").append($("<a>").attr("href", "../coin/"+coin_abbreviation).append($("<p>").text(coin_name + " ($" + coin_abbreviation + ")")))
    const tr = $("<tr>").attr("id", tagId).append(td1)
    tr.append(td2)
    $("#favtable").append(tr)
    try {
        $("#favstar").attr("src", "/img/fullstar.png")
        $("#buttonfavstar").attr("onclick", "deletefav('"+favourite_id+"', true)")
    } catch (err) {}
}