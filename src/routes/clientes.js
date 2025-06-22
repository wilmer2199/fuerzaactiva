const express = require('express');
const router = express.Router();



const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');


router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add');

});

router.post('/add', isLoggedIn, async (req, res) => {
    const { numero_registro,tipo_cliente, nombre_contacto, nombre_empresa, cedula_rif, email_contacto, telefono_contacto, direccion_principal, origen_cliente, descripcion, fecha_registro } = req.body;
    const newRegistro_cliente = {
        numero_registro,
        tipo_cliente,
        nombre_contacto,
        nombre_empresa,
        cedula_rif,
        email_contacto,
        telefono_contacto,
        direccion_principal,
        origen_cliente,
        descripcion,
        fecha_registro: new Date(),
        inicio_id: req.user.id   //este es para enlazar una tarea con un usuario, para que la sesion sea individual
    };
    await pool.query('INSERT INTO registro_cliente set?', [newRegistro_cliente]);
    req.flash('success', 'Ah sido registrado exitosamente!');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const registro_cliente = await pool.query('SELECT * FROM registro_cliente WHERE inicio_id =?', [req.user.id]);
    res.render('links/lits', { registro_cliente });
});

router.get('/delete/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM registro_cliente WHERE ID = ?', [id]);
    req.flash('success', 'Registro eliminado exitosamente');
    res.redirect('/links');

});

router.get('/crearsolicitud/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM registro_solicitud WHERE ID = ?', [id]);
    req.flash('success', 'Empezar Solicitud');
    res.redirect('/links1/add1');

});

router.get('/edit/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const registro_clientes = await pool.query('SELECT * FROM registro_cliente WHERE ID = ?', [id]);
    res.render('links/edit', { registro_cliente: registro_clientes [0] });

});

router.post('/edit/id/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { tipo_cliente, nombre_contacto, nombre_empresa, cedula_rif, email_contacto, telefono_contacto, direccion_principal, origen_cliente, descripcion, fecha_registro } = req.body;
    const newRegistro_cliente = {
        tipo_cliente,
        nombre_contacto,
        nombre_empresa,
        cedula_rif,
        email_contacto,
        telefono_contacto,
        direccion_principal,
        origen_cliente,
        descripcion,
        fecha_registro: new Date(),

    };

    await pool.query('UPDATE registro_cliente set ? WHERE id =?', [newRegistro_cliente, id]);
    req.flash('success', 'Registro actualizado exitosamente');
    res.redirect('/links');
});


module.exports = router;