const nodeMailer = require('nodemailer');

async function sendNotificationEmail(subject, message) {

    const recipients = process.env.MAIL_RECIPIENTS.split(',');
    console.log('recipients', recipients);

    const html = `
        <h1>${subject}</h1>
        <h3>${message}</h3>
    `;


    const transporter = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM_NAME,
        to: recipients,
        subject: subject,
        html: html
    });

    console.log('Message sent: ', info.messageId);
    console.log('Recipient accepted: ', info.accepted);
    console.log('Recipient rejected: ', info.rejected);

}

module.exports = { sendNotificationEmail }
