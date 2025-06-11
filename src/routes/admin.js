const express = require('express');
const router = express.Router();




const handlebars = require ('../lib/handlebars');
const pool = require('../database'); 
const { isLoggedIn, isAdmin } = require('../lib/auth'); // Importar los middlewares
const PDFDocument = require('pdfkit'); //para extraer el pdf 

// --- Helpers para la generación de PDF (Reutilizables) ---



// --- VISTA 1: LISTADO DE TODOS LOS CLIENTES ---
router.get('/clientes', isLoggedIn, isAdmin, async (req, res) => { // Aseguararse de que isAdmin esté de vuelta
    try {
        console.log("-----> INICIO DE CONSULTA DE CLIENTES <-----"); 
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
        console.log("Contenido de 'clientes':", clientes); // ¡ESTE ES EL MÁS IMPORTANTE!
        console.log("Número de clientes:", clientes.length);


        res.render('admin/clientes', { clientes });
    } catch (err) {
        console.error("-----> ERROR EN RUTA /admin/clientes <-----:", err); // SI HAY UN ERROR AQUÍ, SE VERA
        req.flash('message', 'Error al cargar la lista de clientes.');
        req.session.save(() => {
            res.redirect('/admin');
        });
    }
});

//Ruta PDF para Clientes//


router.get('/clientes/download-pdf', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log("-----> INICIO DE GENERACIÓN DE PDF DE CLIENTES <-----");

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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_clientes.pdf"');

        // *** AQUI EMPIEZAN LAS CONSTANTES Y FUNCIONES INCLUIDAS ***
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' }); // Margen 30 como en 'control'
        doc.pipe(res);

        doc.fontSize(16).text('Reporte de Clientes', { align: 'center' });
        doc.moveDown(1);

        const tableStartX = doc.page.margins.left;
        const tableEndX = doc.page.width - doc.page.margins.right;
        let currentY = doc.y;

        const FONT_SIZE = 8; // Adaptado de 'control'
        const LINE_GAP = 2;  // Adaptado de 'control'
        const CELL_PADDING = 5; // Adaptado de 'control' (simplificado de X e Y)
        const LINE_WIDTH = 0.5; // Adaptado de 'control'

        // Definición de columnas para el PDF de CLIENTES (La misma que la última vez, que sumaba 782)
        // SUMA = 782 puntos
        const clientColumns = [
            { id: 'numero_registro', header: 'No. Reg.', width: 35, align: 'left' },
            { id: 'tipo_cliente', header: 'Tipo', width: 50, align: 'left' },
            { id: 'nombre_contacto', header: 'Contacto', width: 75, align: 'left' }, // Cambia a 'center' si lo quieres centrado
            { id: 'nombre_empresa', header: 'Empresa', width: 70, align: 'left' },   // Cambia a 'center' si lo quieres centrado
            { id: 'cedula_rif', header: 'Cédula/RIF', width: 70, align: 'left' },
            { id: 'email_contacto', header: 'Email', width: 70, align: 'left' },
            { id: 'telefono_contacto', header: 'Teléfono', width: 85, align: 'left' },
            { id: 'direccion_principal', header: 'Dirección', width: 90, align: 'left' },
            { id: 'origen_cliente', header: 'Nos Conoció en', width: 70, align: 'left' },
            { id: 'descripcion', header: 'Descripción', width: 90, align: 'left' },
            { id: 'nombre_usuario', header: 'Usuario Creador', width: 55, align: 'left' }, // Cambia a 'center' si lo quieres centrado
            { id: 'fecha_registro', header: 'Fecha Registro', width: 72, align: 'left', format: (date) => date ? new Date(date).toLocaleDateString() : '' }
        ];

        // --- FUNCIONES AUXILIARES INCLUIDAS (ADAPTADAS DE 'control') ---
        const getCellText = (data, col, isHeader) => {
            if (isHeader) return col.header;
            return col.format ? col.format(data[col.id]) : (data[col.id] || '');
        };

        const calculateRowHeight = (data, isHeader = false) => {
            let maxTextHeight = 0;
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(FONT_SIZE); // Usa FONT_SIZE

            clientColumns.forEach(col => { // Usa clientColumns
                const text = getCellText(data, col, isHeader);
                const textWidthForCalc = col.width - (2 * CELL_PADDING); // Usa CELL_PADDING
                const textHeight = doc.heightOfString(text, { width: textWidthForCalc, lineGap: LINE_GAP }); // Usa LINE_GAP
                maxTextHeight = Math.max(maxTextHeight, textHeight);
            });
            return maxTextHeight + (2 * CELL_PADDING); // Usa CELL_PADDING
        };

        const generateTableRow = (y, data, isHeader = false) => {
            const rowHeight = calculateRowHeight(data, isHeader);
            const finalY = y + rowHeight;

            doc.lineWidth(LINE_WIDTH); // Usa LINE_WIDTH

            doc.moveTo(tableStartX, y).lineTo(tableEndX, y).stroke();

            let currentX = tableStartX;
            clientColumns.forEach((col) => { // Usa clientColumns
                const text = getCellText(data, col, isHeader);
                const textWidth = col.width - (2 * CELL_PADDING); // Usa CELL_PADDING
                
                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(FONT_SIZE); // Usa FONT_SIZE
                const actualTextHeight = doc.heightOfString(text, { width: textWidth, lineGap: LINE_GAP }); // Usa LINE_GAP
                
                const textY = y + CELL_PADDING + (rowHeight - actualTextHeight - (2 * CELL_PADDING)) / 2; // Usa CELL_PADDING
                
                doc.text(text, currentX + CELL_PADDING, textY, { // Usa CELL_PADDING
                    width: textWidth,
                    align: col.align,
                    lineGap: LINE_GAP, // Usa LINE_GAP
                });
                
                doc.moveTo(currentX + col.width, y).lineTo(currentX + col.width, finalY).stroke();
                currentX += col.width;
            });

            doc.moveTo(tableStartX, y).lineTo(tableStartX, finalY).stroke();
            doc.moveTo(tableStartX, finalY).lineTo(tableEndX, finalY).stroke();

            return finalY;
        };

        const generateHeader = (startY) => {
            doc.fillColor('black');
            return generateTableRow(startY, {}, true);
        };
        // *** FIN DE CONSTANTES Y FUNCIONES INCLUIDAS ***

        // Dibuja la cabecera inicial para clientes
        currentY = generateHeader(currentY);

        // Dibuja las filas de datos para clientes
        clientes.forEach(cliente => {
            const requiredRowHeight = calculateRowHeight(cliente, false);

            if (currentY + requiredRowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = doc.page.margins.top;
                currentY = generateHeader(currentY);
            }
            currentY = generateTableRow(currentY, cliente);
        });

        doc.end();
        console.log("-----> PDF DE CLIENTES GENERADO Y ENVIADO <-----");

    } catch (err) {
        console.error("-----> ERROR AL GENERAR PDF DE CLIENTES <-----:", err);
        req.flash('message', 'Error al generar el reporte PDF de clientes.');
        req.session.save(() => {
            res.redirect('/admin/clientes');
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
        console.log(`-----> INTENTANDO ELIMINAR CLIENTE CON ID: ${id} <-----`);
        const result = await pool.query('DELETE FROM Clientes WHERE id = ?', [id]);
        console.log("-----> RESULTADO DE LA ELIMINACIÓN DEL CLIENTE <-----:", result);
        
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

// **Ruta PDF para Solicitudes//


router.get('/solicitudes/download-pdf', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log("-----> INICIO DE GENERACIÓN DE PDF DE SOLICITUDES <-----");

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

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_solicitudes.pdf"');

        // *** AQUI EMPIEZAN LAS CONSTANTES Y FUNCIONES INCLUIDAS ***
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' }); // Margen 30 como en 'control'
        doc.pipe(res);

        doc.fontSize(16).text('Reporte de Solicitudes de Servicio', { align: 'center' });
        doc.moveDown(1);

        const tableStartX = doc.page.margins.left;
        const tableEndX = doc.page.width - doc.page.margins.right;
        let currentY = doc.y;

        const FONT_SIZE = 8; // Adaptado de 'control'
        const LINE_GAP = 2;  // Adaptado de 'control'
        const CELL_PADDING = 5; // Adaptado de 'control' (simplificado de X e Y)
        const LINE_WIDTH = 0.5; // Adaptado de 'control'

        // Definición de columnas para el PDF de SOLICITUDES (La misma que la última vez, que sumaba 782)
        // SUMA = 782 puntos
        const solicitudColumns = [
            { id: 'numero_registro', header: 'No. Reg.', width: 40, align: 'left' },
            { id: 'nombre_cliente', header: 'Cliente', width: 65, align: 'left' }, // Cambia a 'center' si lo quieres centrado
            { id: 'tipo_servicio', header: 'Tipo Servicio', width: 60, align: 'left' },
            { id: 'fecha_solicitud', header: 'F. Solicitud', width: 60, align: 'left', format: (date) => date ? new Date(date).toLocaleDateString() : '' },
            { id: 'fecha_requerida', header: 'F. Requerida', width: 60, align: 'left', format: (date) => date ? new Date(date).toLocaleDateString() : '' },
            { id: 'numero_oficiales_requeridos', header: '# Ofic.', width: 45, align: 'center' },
            { id: 'edad_oficiales_requeridos', header: 'Edad Ofic.', width: 40, align: 'center' },
            { id: 'duracion_estimada_horas', header: 'Duración (Hrs)', width: 80, align: 'left' },
            { id: 'direccion_servicio', header: 'Dirección Servicio', width: 90, align: 'left' },
            { id: 'detalles_adicionales', header: 'Detalles Adic.', width: 85, align: 'left' },
            { id: 'descripcion', header: 'Descripción', width: 85, align: 'left' },
            { id: 'nombre_usuario', header: 'Usuario Solicitante', width: 72, align: 'left' } // Cambia a 'center' si lo quieres centrado
        ];

        // --- FUNCIONES AUXILIARES INCLUIDAS (ADAPTADAS DE 'control') ---
        const getCellText = (data, col, isHeader) => {
            if (isHeader) return col.header;
            return col.format ? col.format(data[col.id]) : (data[col.id] || '');
        };

        const calculateRowHeight = (data, isHeader = false) => {
            let maxTextHeight = 0;
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(FONT_SIZE); // Usa FONT_SIZE

            solicitudColumns.forEach(col => { // Usa solicitudColumns
                const text = getCellText(data, col, isHeader);
                const textWidthForCalc = col.width - (2 * CELL_PADDING); // Usa CELL_PADDING
                const textHeight = doc.heightOfString(text, { width: textWidthForCalc, lineGap: LINE_GAP }); // Usa LINE_GAP
                maxTextHeight = Math.max(maxTextHeight, textHeight);
            });
            return maxTextHeight + (2 * CELL_PADDING); // Usa CELL_PADDING
        };

        const generateTableRow = (y, data, isHeader = false) => {
            const rowHeight = calculateRowHeight(data, isHeader);
            const finalY = y + rowHeight;

            doc.lineWidth(LINE_WIDTH); // Usa LINE_WIDTH

            doc.moveTo(tableStartX, y).lineTo(tableEndX, y).stroke();

            let currentX = tableStartX;
            solicitudColumns.forEach((col) => { // Usa solicitudColumns
                const text = getCellText(data, col, isHeader);
                const textWidth = col.width - (2 * CELL_PADDING); // Usa CELL_PADDING
                
                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(FONT_SIZE); // Usa FONT_SIZE
                const actualTextHeight = doc.heightOfString(text, { width: textWidth, lineGap: LINE_GAP }); // Usa LINE_GAP
                
                const textY = y + CELL_PADDING + (rowHeight - actualTextHeight - (2 * CELL_PADDING)) / 2; // Usa CELL_PADDING
                
                doc.text(text, currentX + CELL_PADDING, textY, { // Usa CELL_PADDING
                    width: textWidth,
                    align: col.align,
                    lineGap: LINE_GAP, // Usa LINE_GAP
                });
                
                doc.moveTo(currentX + col.width, y).lineTo(currentX + col.width, finalY).stroke();
                currentX += col.width;
            });

            doc.moveTo(tableStartX, y).lineTo(tableStartX, finalY).stroke();
            doc.moveTo(tableStartX, finalY).lineTo(tableEndX, finalY).stroke();

            return finalY;
        };

        const generateHeader = (startY) => {
            doc.fillColor('black');
            return generateTableRow(startY, {}, true);
        };
        // *** FIN DE CONSTANTES Y FUNCIONES INCLUIDAS ***

        // Dibuja la cabecera inicial para solicitudes
        currentY = generateHeader(currentY);

        // Dibuja las filas de datos para solicitudes
        solicitudes.forEach(solicitud => {
            const requiredRowHeight = calculateRowHeight(solicitud, false);

            if (currentY + requiredRowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentY = doc.page.margins.top;
                currentY = generateHeader(currentY);
            }
            currentY = generateTableRow(currentY, solicitud);
        });

        doc.end();
        console.log("-----> PDF DE SOLICITUDES GENERADO Y ENVIADO <-----");

    } catch (err) {
        console.error("-----> ERROR AL GENERAR PDF DE SOLICITUDES <-----:", err);
        req.flash('message', 'Error al generar el reporte PDF de solicitudes.');
        req.session.save(() => {
            res.redirect('/admin/solicitudes');
        });
    }
});

router.get('/solicitudes/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Servicios WHERE id = ?', [id]);
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