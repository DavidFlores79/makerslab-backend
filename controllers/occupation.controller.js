const { verifyToken } = require('../helpers/jwt.helper');
const entityModel = require('../models/occupation.model');
const userModel = require('../models/user.model');

getData = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await entityModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await entityModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener registros' });
    }
}

postData = async (req, res) => {

    const { name  } = req.body
    const newRecord = new entityModel({ name })
    
    try {

        //validar si existe el registro
        const recordExist = await entityModel.findOne({ name })
        if( recordExist) {
            return res.status(400).send({
                msg: 'La registro está duplicado'
            })
        }
        
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if(!tokenData) {
            return res.status(401).send({msg: 'Su sesión ha caducado 😫'})
        }
    
        const user = await userModel.findById(tokenData._id)
        if(!user.status || user.deleted || !user) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {

            //id del usuario logueado
            newRecord.creator = tokenData._id 
            //console.log(category);

            //guardar en la BD
            await newRecord.save()
        }    

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: newRecord
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
        const data = await entityModel.findByIdAndUpdate(id, resto, {
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
        const data = await entityModel.findByIdAndUpdate(id, {
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