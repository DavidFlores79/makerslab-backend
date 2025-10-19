const { Router } = require('express');
const { verifyGuestToken } = require('../middlewares/validar-jwt.middleware');
const { getPaymentMethods, getPaymentStatus, getUserDashboard, getUserInfo, getUsers, getRoles, getCategories } = require('../controllers/catalogs.controller');
const router = Router()

router.get('/payment-methods',[
    verifyGuestToken,
], getPaymentMethods);

router.get('/payment-status',[
    verifyGuestToken,
], getPaymentStatus);

router.get('/users',[
    verifyGuestToken,
], getUsers);

router.get('/roles',[
    verifyGuestToken,
], getRoles);

router.get('/categories',[
    verifyGuestToken,
], getCategories);

router.get('/user-dashboard/:id',[
    verifyGuestToken,
], getUserDashboard);

router.get('/user-info/:id',[
    verifyGuestToken,
], getUserInfo);

module.exports = router