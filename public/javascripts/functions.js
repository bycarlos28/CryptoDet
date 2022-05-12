$(document).ready(function() {
    function validar_passwords(){
        let password = $('#password').val();
        let password2 = $('#password2').val();
        return password == password2
    }

    $('#enviar').click(function(event) {
        if (validar_passwords() == true){
            console.log('hola')
        }else{
            $('#form').append('<div id="msg_password"><p>Las Contraseñas no coinciden </p></div>')
            event.preventDefault()
        }
      });
});