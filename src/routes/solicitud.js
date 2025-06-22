const express = require ('express');
const router = express.Router();


const pool = require ('../database');

const {isLoggedIn} = require ('../lib/auth');

router.get ('/add1', isLoggedIn, (req, res) => {
    res.render ('links1/add1');

}) ;

router.post('/add1', isLoggedIn, async(req, res) =>{
    const {numero_registro,nombre_cliente,tipo_servicio, fecha_solicitud, fecha_requerida,numero_oficiales_requeridos, edad_oficiales_requeridos, duracion_estimada_horas, direccion_servicio, detalles_adicionales, descripcion } = req.body;
    const newRegistro_solicitud = {
        numero_registro,
        nombre_cliente,
        tipo_servicio,
        fecha_solicitud: new Date(),
        fecha_requerida,   
        numero_oficiales_requeridos,
        edad_oficiales_requeridos,
        duracion_estimada_horas,
        direccion_servicio,
        detalles_adicionales,
        descripcion,
        inicio_id: req.user.id //este es para enlazar una tarea con un usuario, para que la sesion sea individual

    } ;
    await pool.query ('INSERT INTO registro_solicitud set?', [newRegistro_solicitud]);
    req.flash('success', 'Solicitud registrada exitosamente');
    res.redirect ('/links1');
});

router.get('//', isLoggedIn, async (req, res) => {
    const registro_solicitud= await pool.query('SELECT * FROM registro_solicitud WHERE inicio_id =?', [req.user.id]);
    res.render ('links1/lits1', {registro_solicitud});
}); 

router.get ('/delete1/id/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params; 
    await pool.query ('DELETE FROM registro_solicitud WHERE ID = ?', [id]);
    req.flash('success', 'solicitud eliminada exitosamente');
    res.redirect('/links1');
    
});

router.get('/edit1/id/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const registro_solicitudes = await pool.query ('SELECT * FROM registro_solicitud WHERE ID = ?', [id]);
    res.render ('links1/edit1', {registro_solicitud:registro_solicitudes [0]});

});

router.post ('/edit1/id/:id', isLoggedIn, async (req, res) =>{
    const { id } = req.params;
    const {numero_registro, nombre_cliente, tipo_servicio, fecha_solicitud, fecha_requerida,numero_oficiales_requeridos, edad_oficiales_requeridos, duracion_estimada_horas, direccion_servicio, detalles_adicionales, descripcion} = req.body;
    const newRegistro_solicitud = {
        numero_registro,
        nombre_cliente,
        tipo_servicio,
        fecha_solicitud: new Date(),
        fecha_requerida,   
        numero_oficiales_requeridos,
        edad_oficiales_requeridos,
        duracion_estimada_horas,
        direccion_servicio,
        detalles_adicionales,
        descripcion,
        inicio_id: req.user.id //este es para enlazar una tarea con un usuario, para que la sesion sea individual

    } ;

    await pool.query('UPDATE registro_solicitud set ? WHERE id =?', [newRegistro_solicitud, id]);
    req.flash('success', 'solicitud actualizada exitosamente');
    res.redirect ('/links1');
});


module.exports = router;
