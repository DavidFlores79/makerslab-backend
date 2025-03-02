const { sendInfoEmail } = require("../helpers/information-email.helper");

// src/config/constants.js
const USER_ROLE = 'USER_ROLE';
const ADMIN_ROLE = 'ADMIN_ROLE';
const SUPER_ROLE = 'SUPER_ROLE';
const PENDING_PAYMENT = 'PENDIENTE';

const maximumAllowed = (qty) => {
    return `El maximo de documentos permitidos es ${qty}.`;
}

module.exports = { USER_ROLE, ADMIN_ROLE, SUPER_ROLE, PENDING_PAYMENT, maximumAllowed};
