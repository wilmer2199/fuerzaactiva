const express = require ('express');
const router = express.Router();
const correoNotificacion = require ('../functions/correoNotificacion');
const { isLoggedIn } = require('../lib/auth');

router.get ('/home', isLoggedIn,(req, res) =>{
    res.render('home1');
});

router.post ('/contacto', isLoggedIn, (req, res) =>{
    var nombre = req.body.nombre;
    var correoCliente = req.body.correoCliente;
    var telefono= req.body.telefono;
    var fecha_solicitud = req.body.fecha_solicitud;
    var fecha_requerida = req.body.fecha_requerida;
    var descripcion = req.body.descripcion;
    var detalle = req.body.detalle;

    var correoAdmin = "willperez2199@gmail.com";

    // plantilla del correo electronico
    // n # 0 correo notificacion (cualNotificacion, nombre, email, telefono, fecha_solicitud, fecha_requerida, descripcion)
    correoNotificacion(0, nombre, correoAdmin, correoCliente, telefono, fecha_solicitud, fecha_requerida,descripcion, detalle);
    // n # 1 correo notificacion (cualNotificacion, nombre, email, telefono, fecha_solicitud, fecha_requerida, descripcion)
    correoNotificacion(1, nombre, correoCliente, telefono, fecha_solicitud, fecha_requerida,descripcion);

    // plantilla del correo electronico

    res.render ('gracias', {nombre:nombre});

});



router.get ('/contactanos', isLoggedIn, (req, res) => {
    res.render ('home1');
});
module.exports = router; 
