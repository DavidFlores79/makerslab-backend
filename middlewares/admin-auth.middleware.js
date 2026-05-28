const { ADMIN_ROLE, SUPER_ROLE } = require('../config/constants');

const requireAdminSession = (req, res, next) => {
  if (req.session && req.session.adminUser) {
    return next();
  }
  return res.redirect('/admin/login');
};

const isAdminRole = (roleName) => roleName === ADMIN_ROLE || roleName === SUPER_ROLE;

module.exports = { requireAdminSession, isAdminRole };
