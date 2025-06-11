require('dotenv').config();
const express = require ('express');
const morgan = require ('morgan');
const {engine} = require('express-handlebars');   
const path = require ('path');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require ('express-mysql-session')(session);
const passport = require('passport');
const nodemailer = require ('nodemailer');
const {database} =  require('./keys');
const { appendFile } = require('fs');
const router = require('./routes/auth');




// inicializacion del sistema 
const app = express ();
require ('./lib/passport');
require ('./functions/correoNotificacion');
require('./lib/handlebars');


// configuracion, del motor de vistas
app.set('views', path.join(__dirname,'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join (app.get ('views'), 'layouts'),
    partialsDir: path.join(app.get ('views'), 'partials'),
    extname: '.hbs',
    helpers: require ('./lib/handlebars'),
    cache: false,
    
}));

app.set('view engine', '.hbs');
// midelware
// session de middleware funcion que se aejecuta cada que un usuario envie una peticion 
app.use (session ({
    secret: 'fuerzaactiva',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore ({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT || 3306
    }),  
    cookie: {
        secure:false, // ¡CRUCIAL para Render (HTTPS)! para produccion es true
        httpOnly: true, // Buena práctica de seguridad
        sameSite: 'Lax'
    }
}));


app.use(flash());
app.use (express.urlencoded({extended: false}));
app.use (express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use (morgan('dev')); 

app.use ('/' ,require('./routes/auth'));

// varibales globales la primera sera una variable que almacene el nombre de la aplicacion 
app.use ((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.message = req.flash('message');
    res.locals.user = req.user;
    next();
});


// routes  aqui van los puertos de nuestro servidor o las url, las url son las que visita del usuario 


app.use ('/admin', require ('./routes/admin'));
app.use ('/links1', require ('./routes/servicios'));
app.use ('/links', require('./routes/clientes'));
app.use ( require ('./routes/index'));

app.use (require ('./routes/contrasena')); //este es para la  recuperacion de contraseña


app.use (require('./routes/correo'));

//public  , aqui se va a colocar todo lo que el navegador puede acceder 
app.use (express.static(path.join (__dirname, 'public')));

// starting the server, una seccion para iniciar el servidor.
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => { 
    console.log('servidor escuchando en el puerto', PORT); 
});

