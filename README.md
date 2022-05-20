# CryptoDet
## Guide for the installation of the project
### Step 1: <br>
First of all we have to do is clone the project: <br>
```git clone https://github.com/bycarlos28/CryptoDet.git``` <br>
### step 2: <br>
Once we have cloned the repository we will move inside and execute the following command:<br>
What this command will do is install all the dependencies that the project needs to work.<br>
```npm install```<br>
### step 3: <br>
Now we can run the project to do so we execute the following command:<br>
```npm run dev``` or ```node index.js```

### [ESP] Explicación de las funciones disponibles en cryptodet.com <br>
Para utilizar la página web puedes no estar registrado. Sin embargo, las únicas vistas a las que podrás acceder es en el Inicio, donde verás todas las monedas y los datos más relevantes de éstas (precio, capitalización de mercado, volumen, etc) y también podrás acceder a las páginas individuales de cada moneda pulsando sobre el nombre en la tabla del Home o buscándolas a través de nuestro buscador con funciones de autocompletado.
En esta página verás un gráfico del precio variando el precio a lo largo del tiempo. Ésta podrás alternar entre ver los últimos 7 días o solamente las últimas 24 horas.<br>
Al registrarte, podrás crear tus portfolios dándole al icono de usuario y a "Create portfolio". A partir de ahora tendrás un portfolio en el cual podrás empezar a añadir los Assets que tienes dándole a "Add Asset" y rellenando el pequeño formulario con los datos de la compra (si tienes suficientes assets puedes también vender desde este formulario).<br>
Al registrar la posesión de un Asset en tu portfolio podrás acceder a un botón de acceso rápido para hacer una transacción de ese asset ("+") el cual te abrirá la ventana de registrar una nueva compra o venta del Asset que elijas el cual ya estará seleccionado por defecto. Además, también podremos acceder al listado de transacciones desplegando el menú con 3 puntos verticales o eliminar el Asset por completo de nuestro portfolio.<br>
Podemos crear y eliminar tantos portfolios como queramos desde el menú de nuestra izquierda, donde también tendremos acceso rápido a todos los portfolios.<br>
De igual forma podemos añadir las monedas que más nos gusten a favoritos para que nos aparezcan en el menú de la derecha y podremos quitarlas de favorito tanto en el mismo listado de monedas favoritas, como en la página específica de esa moneda, como en el listado de monedas en el home ("/").<br>
Si nuestro usuario está catalogado como Admin, en el menú desplegable de arriba a la derecha donde iría nuestro avatar podremos ver una nueva opción ("(A): Add Coin") es una opción administrativa que nos permitirá añadir todos los datos necesarios en la base de datos para que haya una nueva moneda disponible para registrar en nuestros portfolios además de que se empiecen a ejecutar las consultas a la API pública para ir recolectando los datos del precio de la nueva moneda.<br>
Finalmente, en ese mismo desplegable tendremos la opción de cerrar la sesión dándole a "Log out".

#project developed by: Pau Valls & Carlos Fernandez<br>
#pvallsvilalta@gmail.com // carlosfernandez28correa@gmail.com
