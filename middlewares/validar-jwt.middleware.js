const jwt = require('jsonwebtoken');
const { verifyToken } = require('../helpers/jwt.helper');
const userModel = require('../models/user.model');

const validateJWT = async (req, res, next) => {

    try {
        if(!req.headers.authorization) {
            return res.status(401).send({msg: 'No existe el token del Usuario'})
        }

        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if(!tokenData) {
            return res.status(401).send({ msg: 'Su sesión ha caducado 😫**' })
        }

        usuario = await userModel.findById(tokenData._id)
        if(!usuario.status || usuario.deleted || !usuario) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {
            req.user = usuario
            next()
        }
    } catch (error) {
        res.status(401).send({ msg: 'Usuario no autorizado' })
    }
}

function verifyGuestToken(req, res, next) {
    // Extrae el token desde la cabecera 'x-token'
    const token = req.headers['x-token'];
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token en la cabecera x-token' });
    }
    //imprime el token
    console.log('Guest Token: ', token);
  
    try {
      // Verifica el token usando la llave secreta del guest
    //   const decoded = jwt.verify(token, GUEST_SECRET);
      // Si la verificación es exitosa, asigna la información decodificada a req.user (o req.guest)
    //   req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }


module.exports = { validateJWT, verifyGuestToken }