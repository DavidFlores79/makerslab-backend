const { verifyToken } = require('../helpers/jwt.helper')
const paymentMethodModel = require('../models/payment_method.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await paymentMethodModel.find({ deleted: false })
            .populate('creator', ['name', 'description'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name  } = req.body
    let NAME = name.toUpperCase()
    const paymentMethod = await new paymentMethodModel({ name: NAME })
    
    try {

        //validar si existe La categoría
        const recordExist = await paymentMethodModel.findOne({ name: NAME })
        if( recordExist) {
            return res.status(400).send({
                msg: 'La categoría ya esta registrada.'
            })
        }
        
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if(!tokenData) {
            return res.status(401).send({msg: 'Su sesión ha caducado 😫'})
        }
    
        usuario = await userModel.findById(tokenData._id)
        if(!usuario.status || usuario.deleted || !usuario) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {

            //id del usuario logueado
            paymentMethod.creator = tokenData._id 
            //console.log(category);

            //guardar en la BD
            await paymentMethod.save()
        }    

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: paymentMethod
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({ msg: 'Error al guardar el registro', error: error.message });
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, ...resto } = req.body
    resto.name = resto.name.toUpperCase()

    try {
       
        //guardar en la BD
        const data = await paymentMethodModel.findByIdAndUpdate(id, resto, {
            new: true
        })
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
        const data = await paymentMethodModel.findByIdAndUpdate(id, {
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
            error: error
        })
    }
}

module.exports = { getData, postData, updateData, deleteData }