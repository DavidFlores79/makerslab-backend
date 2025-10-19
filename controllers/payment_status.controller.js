const { verifyToken } = require('../helpers/jwt.helper');
const paymentStatusModel = require('../models/payment_status.model');
const userModel = require('../models/user.model');

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await paymentStatusModel.find({ deleted: false, status: true })
            .populate('creator', ['name', 'email'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name  } = req.body
    const paymentStatus = await new paymentStatusModel({ name })
    
    try {

        //validar si existe el registro
        const recordExist = await paymentStatusModel.findOne({ name })
        if( recordExist) {
            return res.status(400).send({
                msg: 'La registro está duplicado'
            })
        }
        
        paymentStatus.creator = req.user.id;
        await paymentStatus.save()
        
        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: paymentStatus
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
        const data = await paymentStatusModel.findByIdAndUpdate(id, resto, {
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
        const data = await paymentStatusModel.findByIdAndUpdate(id, {
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