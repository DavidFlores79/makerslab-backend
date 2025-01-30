const { verifyToken } = require('../helpers/jwt.helper')
const summaryModel = require('../models/summary.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await summaryModel.find({ deleted: false, status: true })
            .populate('owner', ['name', 'email'])
            .populate('creator', ['name', 'email'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { title, comments, owner, image  } = req.body
    // let NAME = name.toUpperCase()
    const summary = await new summaryModel({ title, comments, owner, image })

    if(image != '') {
        summary.image = image
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
            summary.creator = tokenData._id 
            //console.log(product);

            //guardar en la BD
            await summary.save()
        }    

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: summary
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
        const data = await summaryModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('owner', ['name', 'email']).populate('creator', ['name', 'email'])
        
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
        const data = await summaryModel.findByIdAndUpdate(id, {
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

//TODO: Obtener datos de la tabla thematic_areas o topics


module.exports = { getData, postData, updateData, deleteData, getPaymentMethods }