const express = require('express');
const router = express.Router();

const handlebars = require ('../lib/handlebars');
const pool = require('../database'); 
const { isLoggedIn, isAdmin } = require('../lib/auth'); // Importar los middlewares

// Ruta para el panel General del Administrador (opcional)





// --- VISTA 1: LISTADO DE TODOS LOS CLIENTES ---
router.get('/clientes', isLoggedIn, isAdmin, async (req, res) => { // Asegúrate de que isAdmin esté de vuelta
    try {
        console.log("-----> INICIO DE CONSULTA DE CLIENTES <-----"); // ESTE DEBE APARECER
        const clientes = await pool.query(`
            SELECT
                c.id AS cliente_id,
                c.numero_registro,
                c.tipo_cliente,
                c.nombre_contacto,
                c.nombre_empresa,
                c.cedula_rif,
                c.email_contacto,
                c.telefono_contacto,
                c.direccion_principal,
                c.origen_cliente,
                c.descripcion,
                c.fecha_registro,
                i.nombre_usuario,
                i.nombre_completo AS usuario_creador_nombre
            FROM
                Clientes c
            LEFT JOIN
                inicio i ON c.inicio_id = i.id
            ORDER BY
                c.fecha_registro DESC
        `);

        console.log("-----> FIN DE CONSULTA DE CLIENTES <-----"); // ESTE DEBE APARECER
        console.log("Tipo de 'clientes' recibido:", typeof clientes);
        console.log("¿'clientes' es un arreglo?", Array.isArray(clientes));
        console.log("Contenido de 'clientes':", clientes); // ¡ESTO ES LO MÁS IMPORTANTE!
        console.log("Número de clientes:", clientes.length);


        res.render('admin/clientes', { clientes });
    } catch (err) {
        console.error("-----> ERROR EN RUTA /admin/clientes <-----:", err); // SI HAY UN ERROR AQUÍ, LO VEREMOS
        req.flash('message', 'Error al cargar la lista de clientes.');
        req.session.save(() => {
            res.redirect('/admin');
        });
    }
});

// --- RUTA PARA ELIMINAR UN CLIENTE ---
router.get('/clientes/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Antes de eliminar el cliente, es crucial eliminar cualquier solicitud
        // o registro que dependa de este cliente (si tienes restricciones ON DELETE CASCADE,
        // esto lo hará la base de datos automáticamente, pero es bueno ser explícito
        // o al menos consciente de las dependencias).
        // Por ejemplo, si tienes solicitudes en la tabla 'Servicios'
        // que referencian a 'Clientes', debes manejar esto.
        // Si tienes una relación ON DELETE CASCADE definida en tu DB,
        // MySQL manejará la eliminación de solicitudes relacionadas automáticamente.
        // Si no la tienes, necesitarías algo como:
        // await pool.query('DELETE FROM Servicios WHERE cliente_id = ?', [id]);
        // Y si el cliente tiene una entrada en la tabla 'inicio' (inicio_id),
        // es más complicado si otros clientes o admins usan la misma entrada de 'inicio'.
        // Por ahora, asumiremos que solo se elimina el registro de la tabla 'Clientes'.

        await pool.query('DELETE FROM Clientes WHERE id = ?', [id]);
        req.flash('success', 'Cliente eliminado exitosamente.');
        req.session.save(() => {
            res.redirect('/admin/clientes'); // Redirigir de nuevo a la lista de clientes
        });
    } catch (err) {
        console.error("-----> ERROR AL ELIMINAR CLIENTE <-----:", err);
        req.flash('message', 'Error al eliminar el cliente.');
        req.session.save(() => {
            res.redirect('/admin/clientes');
        });
    }
});




// vista numero 2 listado de las solicitudes de los clientes 

router.get('/solicitudes', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log("-----> INICIO DE CONSULTA DE SOLICITUDES <-----");
        const solicitudes = await pool.query(`
            SELECT
                s.id AS servicio_id,
                s.numero_registro,
                s.nombre_cliente,
                s.tipo_servicio,
                s.fecha_solicitud,
                s.fecha_requerida,
                s.numero_oficiales_requeridos,
                s.edad_oficiales_requeridos,
                s.duracion_estimada_horas,
                s.direccion_servicio,
                s.detalles_adicionales,
                s.descripcion,
                i.nombre_usuario,
                i.nombre_completo AS usuario_solicitante_nombre
            FROM
                Servicios s
            JOIN
                inicio i ON s.inicio_id = i.id
            ORDER BY
                s.fecha_solicitud DESC
        `);

        console.log("-----> FIN DE CONSULTA DE SOLICITUDES <-----");
        console.log("Contenido de 'solicitudes':", solicitudes);
        console.log("Número de solicitudes:", solicitudes.length);

        res.render('admin/solicitudes', { solicitudes });
    } catch (err) {
        console.error("-----> ERROR EN RUTA /admin/solicitudes <-----:", err);
        req.flash('message', 'Error al cargar las solicitudes de servicio.');
        req.session.save(() => {
            res.redirect('/admin');
        });
    }
});

router.get('/solicitudes/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Servicios WHERE id = ?', [id]);
        req.flash('success', 'Solicitud eliminada exitosamente.');
        req.session.save(() => {
            res.redirect('/admin/solicitudes'); // Redirigir de nuevo a la lista de solicitudes
        });
    } catch (err) {
        console.error("-----> ERROR AL ELIMINAR SOLICITUD <-----:", err);
        req.flash('message', 'Error al eliminar la solicitud.');
        req.session.save(() => {
            res.redirect('/admin/solicitudes');
        });
    }
});


module.exports = router;