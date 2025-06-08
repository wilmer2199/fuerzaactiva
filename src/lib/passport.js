const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require ('../database')
const helpers = require ('../lib/helpers');


passport.use('local.signin', new LocalStrategy({
    usernameField: 'nombre_usuario',
    passwordField: 'contrasena',
    passReqToCallback: true // ¡Necesario para tener acceso a req en la estrategia!

}, async (req, nombre_usuario, contrasena, done) => {
    console.log(req.body);
    const rows = await pool.query('SELECT * FROM inicio WHERE nombre_usuario = ?', [nombre_usuario]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(contrasena, user.contrasena);
        if (validPassword) {
            
            done(null, user, { message: 'Bienvenido ' + user.nombre_usuario });
        } else {
            
            done(null, false, { message: 'Contraseña Incorrecta' });
        }
    } else {
        return done(null, false, { message: 'Nombre de usuario no existe' });
    }
}));



passport.use ('local.signup', new LocalStrategy ({
    usernameField: 'nombre_usuario',
    passwordField: 'contrasena',
    passReqToCallback: true
}, async(req, nombre_usuario, contrasena, done) => {
    // 1. Obtener 'correo' de req.body
    const { nombre_completo, confirm_contrasena, correo } = req.body;

    // --- **VALIDACIÓN DE CONTRASEÑA DEL LADO DEL SERVIDOR** ---
    // 1. Validar que las contraseñas coincidan
    if (contrasena !== confirm_contrasena) {
        return done(null, false, req.flash('message', 'Las contraseñas no coinciden.'));
    }

    // 2. Validar complejidad de contraseña (8-15 caracteres, al menos un especial)
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;
    if (!passwordRegex.test(contrasena)) {
        return done(null, false, req.flash('message', 'La contraseña debe tener entre 8 y 15 caracteres y al menos un carácter especial (ej. !, @, #, $, %, ^, &, *).'));
    }

    // 3. Validar campos requeridos adicionales (¡Añade 'correo' aquí!)
    if (!nombre_completo || !nombre_usuario || !contrasena || !confirm_contrasena || !correo) {
        return done(null, false, req.flash('message', 'Por favor, rellena todos los campos, incluyendo el correo electrónico.'));
    }
    // --- FIN VALIDACIÓN DE CONTRASEÑA ---

    try {
        // Verificar si el nombre de usuario ya existe
        const existingUsers = await pool.query('SELECT * FROM inicio WHERE nombre_usuario = ?', [nombre_usuario]);
        if (existingUsers.length > 0) {
            return done(null, false, req.flash('message', 'El nombre de usuario ya está en uso.'));
        }

        // ¡NUEVO! Verificar si el correo ya existe en la base de datos
        // Esto es crucial si se quiere que cada correo sea único
        const existingEmail = await pool.query('SELECT * FROM inicio WHERE correo = ?', [correo]);
        if (existingEmail.length > 0) {
            return done(null, false, req.flash('message', 'Este correo electrónico ya está registrado.'));
        }

        const hashedPassword = await helpers.encryptPassword(contrasena);

        const newUser = {
            nombre_usuario,
            contrasena: hashedPassword, // Guardamos la contraseña hasheada
            nombre_completo,
            correo, // ¡4. se Añade el correo al objeto newUser para insertarlo en la DB!
            rol: 'Cliente' 
        };

        const result = await pool.query('INSERT INTO inicio SET ?', [newUser]);
        newUser.id = result.insertId; // Asigna el ID generado por MySQL

        // Pasa el mensaje de éxito a Passport
        return done(null, newUser, req.flash('success', '¡Te has registrado con éxito!'));

    } catch (e) {
        console.error("Error en la estrategia local.signup:", e);
        return done(e, null, req.flash('message', 'Ocurrió un error al registrar el usuario.'));
    }
}));




passport.serializeUser( (user, done) => {
    done(null,  { id: user.id, rol: user.rol } );
});




passport.deserializeUser(async (idAndRol, done) => {
    
    try {
        // 1. se Corrigio la consulta para obtener los datos básicos del usuario de la tabla 'inicio'
        const inicioUserRows = await pool.query('SELECT id, nombre_usuario, rol FROM inicio WHERE id = ?', [idAndRol.id]);

       if (inicioUserRows.length === 0) {
        
            
             
            return done(new Error('Usuario de inicio no encontrado.'), null);
        }
        const inicioUser = inicioUserRows[0]; // Objeto con id, nombre_usuario, rol de la tabla 'inicio'
        // LOG: Usuario encontrado en tabla 'inicio'
        console.log('DEBUG_PASSPORT: Usuario encontrado en "inicio":', inicioUser.nombre_usuario, 'Rol:', inicioUser.rol);

        let clienteId = null; // Inicializamos clienteId a null

        // 2. Si el rol es 'Cliente', busca su ID correspondiente en la tabla 'Clientes'
        if (inicioUser.rol === 'Cliente') {
            const clienteRows = await pool.query('SELECT id FROM Clientes WHERE inicio_id = ?', [inicioUser.id]);
            if (clienteRows.length === 0) {        
            } else {
                clienteId = clienteRows[0].id; // ¡Este es el ID de la tabla Clientes que necesitamos!
                // LOG: Cliente encontrado en tabla 'Clientes'
                
            }
        }

        // 3. aqui se construye el objeto `req.user` con toda la información relevante
        const fullUserObject = {
            id: inicioUser.id, // ID de la tabla 'inicio' (ID de autenticación)
            nombre_usuario: inicioUser.nombre_usuario,
            rol: inicioUser.rol,
            cliente_id: clienteId // ID de la tabla 'Clientes' (será null si es Admin o si no se encontró)
        };

        console.log('Deserialized User Object:', fullUserObject);

        done(null, fullUserObject);

    } catch (e) {
        console.error("Error en deserializeUser:", e);
        
       done(e, null); // Pasa el error a Passport
    }
});




//passport.deserializeUser( async (idAndRol, done) =>{
    //try {
    //const rows = await pool.query('SELECT id, nombre_usuario, rol * FROM inicio Where id =?', [idAndRol.id]);
    //const user = rows [0];
    //done(null,  {id:user.id, nombre_usuario: user.nombre_usuario, rol: user.rol} );
// } catch (e) {
    //done (e,null)
    //}
//});


   // const rows = await pool.query('SELECT * FROM inicio Where id =?', [id]);
   //asi es como deberia ir pero arroja el error // done (null, rows [0]);

//});    Error: Failed to deserialize user out of session 
//para quitar ese error se usa done(null, id);  este es solo para solucionar.