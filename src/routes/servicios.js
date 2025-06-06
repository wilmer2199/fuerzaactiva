const express = require ('express');
const router = express.Router();


const pool = require ('../database');

const {isLoggedIn} = require ('../lib/auth');

router.get ('/add1', isLoggedIn, (req, res) => {
    res.render ('links1/add1');

}) ;

router.post('/add1', isLoggedIn, async(req, res) =>{
    const {numero_registro,nombre_cliente,tipo_servicio, fecha_solicitud, fecha_requerida,numero_oficiales_requeridos, edad_oficiales_requeridos, duracion_estimada_horas, direccion_servicio, detalles_adicionales, descripcion } = req.body;
    const newServicio = {
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
    await pool.query ('INSERT INTO servicios set?', [newServicio]);
    req.flash('success', 'Solicitud registrada exitosamente');
    res.redirect ('/links1');
});

router.get('//', isLoggedIn, async (req, res) => {
    const servicios= await pool.query('SELECT * FROM servicios WHERE inicio_id =?', [req.user.id]);
    res.render ('links1/lits1', {servicios});
}); 

router.get ('/delete1/id/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params; 
    await pool.query ('DELETE FROM servicios WHERE ID = ?', [id]);
    req.flash('success', 'solicitud eliminada exitosamente');
    res.redirect('/links1');
    
});

router.get('/edit1/id/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const servicios = await pool.query ('SELECT * FROM servicios WHERE ID = ?', [id]);
    res.render ('links1/edit1', {servicio:servicios [0]});

});

router.post ('/edit1/id/:id', isLoggedIn, async (req, res) =>{
    const { id } = req.params;
    const {numero_registro, nombre_cliente, tipo_servicio, fecha_solicitud, fecha_requerida,numero_oficiales_requeridos, edad_oficiales_requeridos, duracion_estimada_horas, direccion_servicio, detalles_adicionales, descripcion} = req.body;
    const newServicio = {
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

    await pool.query('UPDATE servicios set ? WHERE id =?', [newServicio, id]);
    req.flash('success', 'solicitud actualizada exitosamente');
    res.redirect ('/links1');
});


module.exports = router;
