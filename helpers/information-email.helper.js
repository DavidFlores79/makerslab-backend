const nodeMailer = require('nodemailer');

async function sendInfoEmail(name, email, subject, message) {

    const recipients = process.env.MAIL_RECIPIENTS.split(',');
    console.log('recipients', recipients);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Mensaje</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #90bb4d;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 250px;
            margin-bottom: 10px;
        }
        .header h1 {
            font-size: 23px;
            margin: 0;
        }
        .content {
            padding: 30px;
            color: #333333;
        }
        .content h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #90bb4d;
        }
        .content span {
            font-size: 20px;
            margin-bottom: 20px;
            color:rgb(43, 43, 43);
        }
        .content p {
            font-size: 18px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .content .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .content .details p {
            margin: 5px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            color: #777777;
            font-size: 14px;
        }
        .footer a {
            color: #90bb4d;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Encabezado -->
        <div class="header">
            <img src="https://res.cloudinary.com/dltvxi4tm/image/upload/v1749686180/company_logos/bepncppluzzxzflmt9rw.png" alt="Logo Makerslab">
            <h1>Notificación</h1>
        </div>

        <!-- Contenido -->
        <div class="content">
            <h2>Hola <span>${name}</span>,</h2>
            <p>Has recibido un nuevo mensaje. Estos son los detalles:</p>

            <div class="details">
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            </div>

            <p style="margin-top: 20px;">Si requiere alguna aclaración al respecto, favor de ponerse en <a href="https://makerslab-backend.onrender.com/#contact">contacto</a> con la Administración de Makerslab.</p>
        </div>

        <!-- Pie de página -->
        <div class="footer">
            <p>Este es un correo automático, por favor no responder directamente.</p>
            <p>Visita nuestro sitio web: <a href="https://makerslab-backend.onrender.com">Makerslab ${new Date().getFullYear()} </a></p>
        </div>
    </div>
</body>
</html>
    `;


    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP2GO_HOST,
        port: Number(process.env.SMTP2GO_PORT) || 587, // Puerto por defecto para TLS
        secure: false, // TLS se negocia automáticamente
        auth: {
            user: process.env.SMTP2GO_USERNAME,
            pass: process.env.SMTP2GO_PASSWORD
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP2GO_FROM_NAME,
            to: [email, ...recipients],
            subject: subject,
            html: html
        });
        console.log('Message sent: ', info.messageId);
        console.log('Recipient accepted: ', info.accepted);
        console.log('Recipient rejected: ', info.rejected);
    } catch (err) {
        console.error('❗ Error al enviar correo:', err);
        // Aquí puedes reintentar o guardarlo en una cola
    }

}

module.exports = { sendInfoEmail }
