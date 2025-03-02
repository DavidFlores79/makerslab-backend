const { sendInfoEmail } = require("./information-email.helper");

const notifyNewSummary = (item) => {
    return sendInfoEmail(
        item.owner.name,
        item.owner.email,
        `Nuevo Resúmen`,
        `<h2>Se ha registrado un Resúmen en nuestra plataforma</h2>
        <p><b>Nombre del Archivo:</b> ${item.document_name}</p>
        <p><b>Estatus:</b> ${item.document_status.name}</p>
        `
    );
}

const notifyUpdateSummary = (item) => {
    return sendInfoEmail(
        item.owner.name,
        item.owner.email,
        `Estatus de Resúmen Actualizado`,
        `<h2>Se ha actualizado el Estatus de un Resúmen en nuestra plataforma</h2>
        <p><b>Nombre del Archivo:</b> ${item.document_name}</p>
        <p><b>Estatus:</b> ${item.document_status.name}</p>
        `
    );
}

module.exports = { notifyNewSummary, notifyUpdateSummary };
