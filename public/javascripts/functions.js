$( document ).ready(function() {
    $("#enviar").click(function(event) {
        event.preventDefault();
        let username = $('#username').val()
        if(username === ""){
        }
        let mail = $('#mail').val()
        if(mail === ""){
        }
        let password = $('#password').val()
        if(password === ""){
        }
        let password2 = $('#password2').val()
        if(password2 === ""){
        }
        let birth_date = $('#birth_date').val()
        if(birth_date === ""){
        }
        let json = {
            username    :   username,
            email        :   mail,
            password    :   password,
            birth_date  :   birth_date
        }
        if(username,mail,password,password2,birth_date !== ""){
            if(password == password2){
                console.log('vamOS')
                var request = $.ajax({
                    url: "http://localhost:3000/register"+JSON.stringify(json),
                    method: "POST"
                });
            }else{
                console.log('mal')
            }
        }
    });
});