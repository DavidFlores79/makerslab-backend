const { sendInfoEmail } = require("./information-email.helper");

const notifyNewPayment = (item) => {
    return sendInfoEmail(
        item.owner.name,
        item.owner.email,
        `Nuevo Pago`,
        `<h2>Se ha registrado un Pago en nuestra plataforma</h2>
        <p><b>Concepto:</b> ${item.description}</p>
        <p><b>Total:</b> $${item.amount}</p>
        <p><b>Estatus:</b> ${item.payment_status.name}</p>
        `
    );
}

const notifyUpdatePayment = (item) => {
    return sendInfoEmail(
        item.owner.name,
        item.owner.email,
        `Estatus de Pago Actualizado`,
        `<h2>Se ha actualizado el Estatus de un pago en nuestra plataforma</h2>
        <p><b>Concepto:</b> ${item.description}</p>
        <p><b>Total:</b> $${item.amount}</p>
        <p><b>Estatus:</b> ${item.payment_status.name}</p>
        `
    );
}

module.exports = { notifyNewPayment, notifyUpdatePayment };
