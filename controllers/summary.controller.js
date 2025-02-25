const { USER_ROLE } = require('../config/constants');
const { verifyToken } = require('../helpers/jwt.helper')
const summaryModel = require('../models/summary.model')
const summaryStatusModel = require('../models/summary_status.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const user = await verifyToken(token)

        if(!user) {
            return res.status(401).send({msg: 'Su sesión ha caducado 😫'})
        }

        // Query con filtros
        const query = { deleted: false };
        if(user.role.name == USER_ROLE) {
            query.owner = user._id
        }

        // Consulta para documentos
        const data = await summaryModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('document_status')
            .populate('owner', ['name', 'email'])
            .populate('creator', ['name', 'email']);

        // Consulta para total de documentos
        const totalItems = await summaryModel.countDocuments(query);

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

    const { title, comments, owner, document, document_name } = req.body
    // let NAME = name.toUpperCase()

    console.log( req.body );
    
    
    if(!document || document == '') {
        return res.status(400).send({msg: 'El documento no se ha cargado correctamente.'})
    }
    const summary = await new summaryModel({ title, comments, document, document_name, owner })
    
    try {
        
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

            const sumaryStatuses = await summaryStatusModel.find({ status: true })
            const initialSummaryStatus = sumaryStatuses[0]
            summary.document_status = initialSummaryStatus._id

            //id del usuario logueado
            summary.creator = tokenData._id
            if(tokenData.role.name == USER_ROLE) {
                summary.owner = tokenData._id
            } 
            //console.log(product);

            //guardar en la BD
            await summary.save()

            //consultar nuevamente para obtener el registro con los datos de las tablas relacionadas
            const data = await summaryModel.findById(summary._id)
                    .populate('owner', ['name', 'email'])
                    .populate('creator', ['name', 'email'])
                    .populate('document_status')

            res.status(201).send({
                msg: 'Registro creado correctamente.',
                data
            });
        }
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
    const { _id, document, ...resto } = req.body

    try {

        if(!document || document == '') {
            return res.status(400).send({msg: 'El documento no se ha cargado correctamente.'})
        }    
       
        //guardar en la BD
        const data = await summaryModel.findByIdAndUpdate(id, { document, ...resto }, {
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