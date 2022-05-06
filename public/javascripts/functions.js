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

function deletefav(favid) {
    const id = parseInt(favid)
    const tagId = '#fav_'+id.toString()
    const query = 'DELETE FROM favourites WHERE favourites_id='+id+';'
    $.ajax({
        url: "http://localhost:3001/consulta/"+query,
        method: "GET"
    });
    $(tagId).remove()
}