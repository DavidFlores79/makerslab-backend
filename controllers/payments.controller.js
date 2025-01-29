const { verifyToken } = require('../helpers/jwt.helper')
const paymentMethodModel = require('../models/payment_method.model')
const paymentModel = require('../models/payment.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await paymentModel.find({ deleted: false, status: true })
            .populate('user', ['name', 'email'])
            .populate('payer', ['name', 'email'])
            .populate('payment_method')
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { description, comments, payment_method, amount, image, payer_id  } = req.body
    // let NAME = name.toUpperCase()
    const payment = await new paymentModel({ description, comments, payment_method, amount, payer: payer_id })

    if(image != '') {
        payment.image = image
    }
    
    try {
        
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if(!tokenData) {
            return res.status(401).send({msg: 'Token no válido. *'})
        }
    
        user = await userModel.findById(tokenData._id)
        if(!user.status || user.deleted || !user) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {

            //id del usuario logueado
            payment.user = tokenData._id 
            //console.log(product);

            //guardar en la BD
            await payment.save()
        }    

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: payment
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
    const { _id, ...resto } = req.body

    try {
       
        //guardar en la BD
        const data = await paymentModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('user', ['name', 'email']).populate('payer', ['name', 'email']).populate('payment_method')
        
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
        const data = await paymentModel.findByIdAndUpdate(id, {
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

getPaymentMethods = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await paymentMethodModel.find({ deleted: false, status: true })
            .populate('user', ['name', 'email'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getPaymentMethods }