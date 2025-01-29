const bcryptjs = require('bcryptjs');
const { googleVerifyToken } = require('../helpers/google-auth.helper');
const { generarJWT } = require('../helpers/jwt.helper');
const bcrypt = require('bcryptjs');
const userModel = require("../models/user.model");
const roleModel = require('../models/role.model');
const { sendNotificationEmail } = require('../helpers/email-notifications.helper');

const login = async (req, res) => {

    const { email, password } = req.body

    try {

        const user = await userModel.findOne({ email }).populate('role')

        if(!user) {
            return res.status(400).send({
                msg: 'Usuario/Password no son correctos - correo'
            })
        }

        if(!user.status) {
            return res.status(401).send({
                msg: 'Usuario bloqueado - status'
            })
        }

        const validPassword = bcryptjs.compareSync( password, user.password )
        if(!validPassword) {
            return res.status(400).send({
                msg: 'Usuario/Password no son correctos - pass'
            })
        }

        //generar el JWT
        const jwt = await generarJWT(user)
        console.log(`${user.name} se ha logueado correctamente!`);

        return res.send({
            msg: 'login correcto',
            user,
            jwt,
            
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            msg: 'Error en el login!',
            error: error
        })
    }


}

const register = async (req, res) => {

    const { name, email, password, image } = req.body
    let { role } = req.body;
    console.log('user role', role);

    try {
        if(!role) {
            const userRole = await roleModel.findOne({ name: 'USER_ROLE' });
            if (!userRole) {
                // Si no se encuentra el rol, devuelve un mensaje de error
                return res.status(404).send({ msg: 'No se encontró el rol para dar de alta al usuario' });
            }

            role = userRole._id; 
            console.log('role del user', userRole);
        }
    
        const data = await new userModel({ name, email, password, role }).populate('role');
    
        if(image != '') {
            data.image = image
        }

        //encriptar la contraseña
        const salt = bcrypt.genSaltSync()
        data.password = bcrypt.hashSync(password, salt)
        
        //guardar en la BD
        await data.save()

        //generar el JWT
        const jwt = await generarJWT(data)
        
        sendNotificationEmail('NUEVO USUARIO', 
        `Se ha creado al usuario ${data.name} con perfil ${data.role.name}.`);

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            user: data,
            jwt,
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({
            msg: 'Error al guardar el registro',
            error
        })
    }
}

const googleSignIn = async(req, res) => {


    const { id_token } = req.body

    try {
        const { name, image, email } = await googleVerifyToken( id_token )
        
        const user = await userModel.findOne({ email }).populate('role');

        if(!user) {

            const data = {
                name,
                email,
                image,
                password: ':PPPPP',
                google: true,
            }

            console.log(data);

            const newUser = new userModel( data )
            await newUser.save()
            res.send({
                msg: 'Google SignIn Correcto. Usuario creado',
                newUser
            })
        }

        if(!user.status) {
            res.status(401).send({
                msg: 'Usuario Bloqueado, favor de validar',
            })
        }


        //guardar en la BD
        const userUpdated = await userModel.findOneAndUpdate({email}, {name, email, image}, {
            new: true
        })
    
        //generar el JWT
        const jwt = await generarJWT(userUpdated)
        console.log(`${userUpdated.name} se ha logueado correctamente con Google SignIn!`);

        res.send({
            msg: 'login correcto',
            user,
            jwt,
            
        })


    } catch (error) {
        console.log(error);
        return res.status(401).send({
            msg: 'Error en Google SignIn!',
            error: error
        })
        
    }

}

module.exports = { login, register, googleSignIn }