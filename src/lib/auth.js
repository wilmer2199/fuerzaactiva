module.exports = {

    isLoggedIn(req, res, next){    // isloggedin estara en las rutas si el usuario esta logueado 
        console.log("-----> MIDD: isLoggedIn ejecutando <-----");
        if (req.isAuthenticated ()) {     // esto es para proteger las rutas
            console.log("-----> MIDD: isLoggedIn - USUARIO AUTENTICADO <-----");
            return next();

        } 
        console.log("-----> MIDD: isLoggedIn - USUARIO NO AUTENTICADO, REDIRIGIENDO A /login <-----");
        req.flash('message', 'Necesitas iniciar sesión para acceder a esta página.');
        return res.redirect ('/signin');
    }, 
    
    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated ()) {    // este metodo se usa para que el usuario no vea algunas rutas 
            return next ();                // cuando ya esta logueado
        }
        return res.redirect('/redirect-after-login');

    },


    // ¡¡¡NUEVO MIDDLEWARE PARA VERIFICAR EL ROL DE ADMINISTRADOR!!!
    isAdmin(req, res, next) {
        
        // Primero, verifica si el usuario está autenticado.
        // Después, verifica si el rol del usuario autenticado es 'Admin'.
        if (req.isAuthenticated()) {
        console.log('isAdmin - req.user.rol:', req.user.rol); // <-- Añade este
         }

        if (req.isAuthenticated() && req.user.rol === 'Admin') {
            return next(); // Si es un administrador, permite el acceso a la siguiente función de la ruta.
        }
        // Si no está autenticado O su rol no es 'Admin', niega el acceso.
        req.flash('message', 'Acceso denegado. Solo administradores.');
        return res.redirect('/signin'); 
    }
};


