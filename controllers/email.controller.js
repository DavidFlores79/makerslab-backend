const { sendEmail } = require("../helpers/contact-email.helper");

sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await sendEmail(name, email, subject, message);

        res.send({
            msg: 'Email enviado correctamente',
            data: {
                name,
                email,
                message
            }
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al enviar correo' });
    }
}

module.exports = { sendContactEmail }