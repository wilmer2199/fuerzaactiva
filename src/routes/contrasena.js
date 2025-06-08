const express = require ('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const pool = require('../database');
const bcrypt = require('bcryptjs'); // Para hashear y comparar contraseñas
const crypto = require('crypto'); // Para generar tokens
const nodemailer = require('nodemailer'); // Para enviar correos

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // O el host de tu proveedor de correo (ej: Outlook, Yahoo)
    port: 465, // Puerto SMTP
    secure: true, // true para 465, false para otros puertos como 587
    auth: {
        user: 'willperez2199@gmail.com', //  dirección de correo
        pass: 'fkrrwfadlauvrbml' //  contraseña o "Contraseña de aplicación en gmail" si se usa 2FA
    },
    tls: {
        ciphers: 'SSLv3' // Esto a veces es necesario para algunos servidores SMTP antiguos o específicos
    }
});

router.get('/forgotPassword', isNotLoggedIn, (req, res) => {
    res.render('auth/forgotPassword'); 
});

// 2. Procesar solicitud de recuperación (generar token y enviar email)
router.post('/forgotPassword', isNotLoggedIn, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        req.flash('message', 'Por favor, introduce tu correo electrónico.');
        return res.redirect('/forgotPassword');
    }

    try {
        const user = await pool.query('SELECT * FROM inicio WHERE correo = ?', [email]);
        if (user.length === 0) {
            req.flash('message', 'No se encontró una cuenta con ese correo electrónico.');
            return res.redirect('/forgotPassword');
        }

        const userFound = user[0];
        const token = crypto.randomBytes(20).toString('hex'); // Generar un token único
        const expires = Date.now() + 3600000; // Token válido por 1 hora (3600000 ms)

        // Guardar el token y su fecha de expiración en la base de datos
        await pool.query('UPDATE inicio SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?', [token, expires, userFound.id]);

        // Enviar el correo electrónico
        const mailOptions = {
            to: userFound.correo,
            from: 'willperez2199@gmail.com', // Debe ser la misma dirección de 'user' en transporter
            subject: 'Restablecimiento de Contraseña - Fuerza Activa CA',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #0056b3;">Restablecimiento de Contraseña</h2>
                    <p>Has recibido este correo porque tú (o alguien más) solicitó un restablecimiento de contraseña para tu cuenta.</p>
                    <p>Por favor, haz clic en el siguiente botón para completar el proceso:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="http://${req.headers.host}/resetPassword/${token}"
                           style="background-color: #007bff; background-color-hover:rgb(0, 0, 0); color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-outline-block;">
                           Restablecer Contraseña
                        </a>
                    </p>
                    <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                    <p><a href="http://${req.headers.host}/resetPassword/${token}" style="color: #007bff; text-decoration: underline;">http://${req.headers.host}/resetPassword/${token}</a></p>
                    <p>Si no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.</p>
                    <p style="font-size: 0.9em; color: #777;">Atentamente,<br>El equipo de Fuerza Activa De Oriente, C.A</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        req.flash('success', 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.');
        res.redirect('/signin');

    } catch (error) {
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        req.flash('message', 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.');
        res.redirect('/forgotPassword');
    }
});

// 3. Mostrar formulario para restablecer contraseña (con token)
router.get('/resetPassword/:token', isNotLoggedIn, async (req, res) => {
    try {
        const { token } = req.params;
        const user = await pool.query('SELECT * FROM inicio WHERE reset_password_token = ? AND reset_password_expires > ?', [token, Date.now()]);

        if (user.length === 0) {
            req.flash('message', 'El token de restablecimiento de contraseña es inválido o ha expirado.');
            return res.redirect('/forgotPassword');
        }

        res.render('auth/resetPassword', { token }); 
    } catch (error) {
        console.error('Error al mostrar formulario de restablecimiento:', error);
        req.flash('message', 'Ocurrió un error. Inténtalo de nuevo.');
        res.redirect('/forgotPassword');
    }
});

// 4. Procesar restablecimiento de contraseña (actualizar contraseña)
router.post('/resetPassword/:token', isNotLoggedIn, async (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (password !== confirm_password) {
        req.flash('message', 'Las contraseñas no coinciden.');
        return res.redirect(`/resetPassword/${token}`);
    }

    try {
        const user = await pool.query('SELECT * FROM inicio WHERE reset_password_token = ? AND reset_password_expires > ?', [token, Date.now()]);

        if (user.length === 0) {
            req.flash('message', 'El token de restablecimiento de contraseña es inválido o ha expirado.');
            return res.redirect('/forgotPassword');
        }

        const userFound = user[0];
        console.log('ID del usuario a actualizar:', userFound.id);
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo del salt, es lo ideal pero se puede ajustar
        console.log('Nuevo hash de contraseña generado:', hashedPassword);

        // Actualizar la contraseña y limpiar el token
        const updateResult = await pool.query('UPDATE inicio SET contrasena = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?', [hashedPassword, userFound.id]);
        console.log('Resultado del UPDATE de contraseña:', updateResult); 
        req.flash('success', 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.');
        res.redirect('/signin');

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        req.flash('message', 'Ocurrió un error al restablecer tu contraseña. Inténtalo de nuevo.');
        res.redirect(`/resetPassword/${token}`);
    }
});

module.exports = router;