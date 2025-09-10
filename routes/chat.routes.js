// routes/chat.routes.js
const express = require('express');
const { startConversation, sendMessage, getConversationHandler } = require('../controllers/chatController');
const { startSchema, messageSchema } = require('../validators/chatValidators');
const validate = require('../middlewares/validate');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const router = express.Router();

router.post('/start', [
    validate(startSchema),
    validarJWT
], startConversation);
router.post('/message', validate(messageSchema), sendMessage);
router.get('/:id', getConversationHandler);
router.get('/user/:userId', getConversationHandler);

module.exports = router;