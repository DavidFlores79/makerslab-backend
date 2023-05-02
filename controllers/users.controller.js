const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await userModel.find({ deleted: false })
            .limit(limite)
            .skip(desde)
            .populate('role');

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name, email, password, image } = req.body
    let { role } = req.body;
    console.log('user role', role);

    if(!role) {
        const userRole = await roleModel.findOne({ name: 'USER_ROLE' });
        role = userRole._id; 
        console.log('role del user', userRole);
    }

    const data = await new User({ name, email, password, role }).populate('role');

    if(image != '') {
        data.image = image
    }
    
    try {

        //encriptar la contraseña
        const salt = bcrypt.genSaltSync()
        data.password = bcrypt.hashSync(password, salt)
        
        //guardar en la BD
        await data.save()

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({
            msg: 'Error al guardar el registro',
            error
        })
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, password, google, ...resto } = req.body
    console.log('resto', resto);
    try {

        if( password ) {
            //encriptar la contraseña
            const salt = bcrypt.genSaltSync()
            resto.password = bcrypt.hashSync(password, salt)
        }
        
        //guardar en la BD
        const data = await userModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('role');

        res.send({
           msg: `Se ha actualizado el registro`,
           data
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({
            msg: 'Error al actualizar el registro',
            error
        })
    }

}

deleteData = async (req, res) => {
    
    const { id } = req.params

    try {

        //guardar como eliminado en la BD
        const data = await userModel.findByIdAndUpdate(id, {
            status: false,
            deleted: true
        }, { new: true })
        res.send({
           msg: `Se ha eliminado el registro.`,
           data
        });        
    } catch (error) {   
        console.log(error);
        res.status(500).send({
            msg: 'Error al eliminar el registro',
            error
        })
    }
}

getRoles = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await roleModel.find({ deleted: false, status: true })
            .limit(limite)
            .skip(desde)
            // .populate('modules')

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getRoles }