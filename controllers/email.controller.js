const { sendContactMeEmail } = require("../helpers/contact-email.helper");
const { sendInfoEmail } = require("../helpers/information-email.helper");

sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await sendContactMeEmail(name, email, subject, message);

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

sendInformacionEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        await sendInfoEmail(name, email, subject, message);

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

module.exports = { sendContactEmail, sendInformacionEmail }