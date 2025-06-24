const nodeMailer = require('nodemailer');

async function sendNotificationEmail(subject, message) {
    const recipients = process.env.MAIL_RECIPIENTS.split(',');
    console.log('Recipients:', recipients);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
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
            <img src="https://congresopromocionsalud.com/assets/public/img/brand/logo_congreso.png"  alt="Logo de Congreso Promoción Salud">
            <h1>${subject}</h1>
        </div>

        <!-- Contenido -->
        <div class="content">
            <p>Se ha realizado un cambio:</p>

            <div class="details">
                <p>${message}</p>
            </div>
   
        </div>

        <!-- Pie de página -->
        <div class="footer">
            <p>Este es un correo automático, por favor no responder directamente.</p>
            <p>Visita nuestro sitio web: <a href="https://congresopromocionsalud.com">Congreso  Promoción Salud ${new Date().getFullYear()}</a></p>
        </div>
    </div>
</body>
</html>
    `;

    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP2GO_HOST,
        port: Number(process.env.SMTP2GO_PORT) || 587,
        secure: false,
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
            to: recipients,
            subject: subject,
            html: html
        });
        console.log('Correo enviado:', info.messageId);
        console.log('Aceptado por:', info.accepted);
        console.log('Rechazado por:', info.rejected);
    } catch (err) {
        console.error('❗ Error al enviar el correo:', err);
    }
}

module.exports = { sendNotificationEmail };