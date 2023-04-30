const jwt = require('jsonwebtoken')
const { getUserMenu } = require('../controllers/module_permission_role.controller')

const generarJWT = ( user ) => {

    return new Promise( async ( resolve, reject) => {

        const payload = {
            _id: user.id,
            role : user.role,
        }

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '2h'
        }, (err, token) => {
            if(err) {
                console.log(err)
                reject('No se pudo generar el token')
            } else {
                resolve(token)
            }
        })

    })

}

const verifyToken = async (token) => {

    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return null
    }

}

module.exports = { generarJWT, verifyToken }