const { Router } = require('express');
const { body } = require('express-validator');
const { requireAdminSession } = require('../middlewares/admin-auth.middleware');
const ctrl = require('../controllers/admin.controller');

const router = Router();

// Public routes
router.get('/login', ctrl.getLogin);
router.post('/login', [
  body('email', 'Email requerido').isEmail().normalizeEmail(),
  body('password', 'Password requerido').not().isEmpty(),
], ctrl.postLogin);

router.post('/logout', requireAdminSession, ctrl.postLogout);

// Protected routes
router.use(requireAdminSession);

router.get('/', ctrl.getDashboard);
router.get('/users', ctrl.getUsersList);
router.get('/users/:id', ctrl.getUserDetail);
router.post('/users/:id/toggle-status', ctrl.postToggleUserStatus);
router.post('/users/:id/delete', ctrl.postDeleteUser);
router.post('/users/:id/change-role', ctrl.postChangeUserRole);
router.post('/users/:id/reset-password', ctrl.postResetPassword);


module.exports = router;
