const { verifyToken } = require('../helpers/jwt.helper')
const paymentMethodModel = require('../models/payment_method.model')
const paymentModel = require('../models/payment.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await paymentModel.find({ deleted: false, status: true })
            .populate('creator', ['name', 'email'])
            .populate('owner', ['name', 'email'])
            .populate('payment_method')
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { _id, image, ...resto  } = req.body
    // let NAME = name.toUpperCase()
    const payment = await new paymentModel({ ...resto })

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
    
        const user = await userModel.findById(tokenData._id)
        if(!user.status || user.deleted || !user) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {
            //id del usuario logueado
            payment.creator = tokenData._id 
            //console.log(product);

            //guardar en la BD
            await payment.save()

            const data = await paymentModel.findByIdAndUpdate(payment._id, resto, {
                new: true
            }).populate('owner', ['name', 'email']).populate('creator', ['name', 'email']).populate('payment_method')

            res.status(201).send({
                msg: 'Registro creado correctamente.',
                data: data
            });
        }    

        
    } catch (error) {   
        console.log(error);
        res.status(500).send({ msg: 'Error al guardar el registro', error: error.message });
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, ...resto } = req.body

    try {
       
        //guardar en la BD
        const data = await paymentModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('owner', ['name', 'email']).populate('creator', ['name', 'email']).populate('payment_method')
        
        res.send({
           msg: `Se ha actualizado el registro`,
           data
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({ msg: 'Error al guardar el registro' });
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
            .populate('creator', ['name', 'email'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getPaymentMethods }