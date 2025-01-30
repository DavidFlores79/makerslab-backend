const { verifyToken } = require('../helpers/jwt.helper')
const eventParticipantModel = require('../models/event_participant.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await eventParticipantModel.find({ deleted: false, status: true })
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

    const { owner  } = req.body
    try {

        const participant = new eventParticipantModel(req.body)
        
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
            
            //si se envia el owner se adjunta si no se le coloca el usuario logueado
            participant.creator = tokenData._id 
            participant.owner = (owner != '') ? owner : tokenData._id 

            //validar si existe el registro
            const recordExist = await eventParticipantModel.findOne({ owner: participant.owner })
            if( recordExist) {
                return res.status(400).send({
                    msg: 'La registro está duplicado'
                })
            }
            
            //guardar en la BD
            await participant.save()

            //actualizar al usuario la informacion del registro creado
            if (owner != '') {
                const ownerData = await userModel.findById(owner)
                ownerData.event_participant = ownerData._id
                ownerData.save()
            } else { 
                user.event_participant = participant._id
                await user.save()
            }
        }

        // 2. Obtener el participante de la base de datos con populate  
       const populatedPart = await eventParticipantModel.findById(participant._id)  
       .populate('owner', ['name', 'email'])  
       .populate('creator', ['name', 'email']);  

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: populatedPart
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
        const data = await eventParticipantModel.findByIdAndUpdate(id, resto, {
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
        const data = await eventParticipantModel.findByIdAndUpdate(id, {
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