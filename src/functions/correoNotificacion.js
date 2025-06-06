const nodemailer = require ('nodemailer');

//configuracion del correo electronico

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // upgrade later with STARTTLS
   auth: {
    user: "willperez2199@gmail.com",
    pass: "fkrrwfadlauvrbml",
    },
});
//configuracion del correo electronico
 

module.exports = function (cualNotificacion, nombre , correoCliente, telefono, fecha_solicitud, fecha_requerida, descripcion, detalle){
    //notificaciones 
    //notificacion 0 es del formulario de contacto. esta llegara al administrador del software
    // notificacion 1 es del formulario de contacto. esta llegara al cliente.

    let notificaciones= [
        {
            subject: "Nuevo formulario de solicitud enviado",
            titulo: " Nueva solicitud enviada",
            Notificacion: "Hola administrador. Se ha registrado una nueva solicitud de servicio requerida a través de la plataforma web de Fuerza Activa De Oriente, C.A. Esta notificación inmediata busca informar que se ha expresado una necesidad concreta por el servicio de oficiales de seguridad, completando todos los datos necesarios para su evaluación. Es crucial que esta solicitud reciba su atención prioritaria para asegurar una respuesta oportuna y mantener la calidad del servicio. Aquí estan los datos. Nombre:  " + nombre +  ", correoCliente:  " + telefono + ", telefono:  " + fecha_solicitud  +", fecha_solicitud:  " + fecha_requerida + ", fecha_requerida:  " + descripcion +", descripcion:  " + detalle + "."      
        },
        {
            subject: "!Hemos recibido tu solicitud!",
            titulo: " Pronto seras atendido ",
            Notificacion: "Hola " + nombre + ". Hemos recibido tu solicitud y en breve nuestro equipo se pondra en contacto contigo."
        }
    ]


    // aqui viene la plantilla htmla para enviar el correo
let Html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <style>
        p, a, h1, h2, h3, h4, h5, h6 {font-family: 'Roboto', sans-serif !important;}
        h1{font-size: 30px !important;}
        h2{font-size: 25px !important;}
        h3{font-size: 18px !important;}
        h4{font-size: 16px !important;}
        p, a{font-size: 15px !important;}

        .claseboton{
            width: 30%;
                background-color: #3b4efc;
                border: 2px solid #3b5efc;
                color: black;
                padding: 16px 32px;
                text-align: center;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                transition-duration: 0.4s;
                cursor: pointer;
        }

        .claseboton:hover{
            background-color: #000000;
            color: #ffffff;
        }

        .imag{
            width: 25px;
            height: 25px;
        }
        
        .conTa{
            margin: 0px 5px 0px 5px;
        }

        .afooter{
            color: #ffffff !important;
            text-decoration: none;
            font-size: 13px !important;

        }
    </style>

</head>
<body>
    <div style=" width: 100%; background-color: #e3e3e3;">
        <div style="padding: 20px 10px 20px 10px;">
            <!-- imagen inicial de la marca-->
             <div style="background-color: #e3e3e3; padding: 10px 0px 10px 0px; width: 100%; text-align: center;"> 
                <img src="cid:fa2l" alt="" style="width: 150px; height: 120px; ">
             </div>
            <!-- imagen inicial de la marca-->
             
            <!-- contenido principal-->
             <div style="background-color: #ffffff; padding: 20px 0px 5px 0px; width: 100%; text-align: center;">
                    <h2> ${notificaciones [cualNotificacion].titulo} </h2>
                    <p>${notificaciones [cualNotificacion].Notificacion}</p>
                       <!-- mensaje de gracias-->
                    <p>¡Gracias por su tiempo!</p>
                    <p style="margin-bottom: 50px;"> <i>Atentamente:</i> <br> Fuerza Activa de Oriente C.A</p>

                     <!-- boton que los redireccione al sitio web-->
                      <a class="claseboton" href="http://localhost:3000/signin">FuerzaActivadeOrienteCA</a>

             </div>
            <!-- contenido principal-->

            <!-- Footer -->
             <div style="background-color: #191919; color: #ffffff; padding: 5px 0px 0px 0px; width: 100%; text-align: center;">
                 <!-- redes sociales -->
                <a href="https://www.instagram.com/fuerzaactiva.deoriente?igsh=czk3ZmswdG15ZzZx&utm_source=qr" class="conTa"> <img src="cid:Ig1" class="imag"></a>
                <a href="https://wa.me/qr/M5TBZG65DJZRD1"  class="conTa" >  <img src= "cid:ws1" class="imag"> </a>
                <a href="mailto:fuerzaactivadeoriente@gmail.com?subject=Informacion%20sobre%20oficiales%20de%20seguridad&body=Requiero%20mas%20informacion%20sobre%20sus%20servicios%20de%20vigilancia%20privada!" class="conTa" > <img src="cid:co1" class="imag"></a>
                 <!-- redes sociales -->

                 <h4>Soporte</h4>
                 <p style="font-size: 13px; padding: 0px 20px 0px 20px; ">
                    Comunicate con nosotros por los siguientes medios: <br>
                    Correo: <a  class="afooter" href="mailto:fuerzaactivadeoriente@gmail.com">fuerzaactivadeoriente@gmail.com</a> <br>
                    Whatsapp: <a class="afooter" href="https://wa.me/qr/M5TBZG65DJZRD1">+584149513574</a>
                 </p>

                 <p style="background-color: black; padding: 10px 0px 10px 0px; font-size: 12px !important;" >
                    © 2025 Fuerza Activa De Oriente, C.A, todos los derechos reservados 
                 </p>
             </div>
            <!-- Footer -->


        </div>
    </div>
</body>
    </html>`;

    // aqui viene la plantilla htmla para enviar el correo

    // notificar o enviar  el correo electronico
    transporter.verify().then(console.log).catch(console.error);
    transporter.sendMail({
    from: '"Fuerza Activa De Oriente C.A" <willperez2199@gmail.com> ',
    to: correoCliente,
    subject: notificaciones [cualNotificacion].subject,
    html: Html,
    attachments: [
    {
    filename: 'Ig1.png',
    path: './src/public/img/Ig1.png',
    cid: 'Ig1',
    },
    {
    filename: 'ws1.png',
    path: './src/public/img/ws1.png',
    cid: 'ws1',
    },
    {
    filename: 'co1.png',
    path: './src/public/img/co1.png',
    cid: 'co1',
    },
    {
    filename: 'fa2l.png',
    path: './src/public/img/fa2l.png',
    cid: 'fa2l',
    }
    ], 
    }).then ( info => {
    console.log ({info});
    }).catch(console.error);
    // notificar o enviar  el correo electronico
}  
    

