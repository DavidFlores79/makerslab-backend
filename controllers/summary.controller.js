const { USER_ROLE, maximumAllowed } = require('../config/constants');
const { verifyToken } = require('../helpers/jwt.helper')
const summaryModel = require('../models/summary.model')
const summaryStatusModel = require('../models/summary_status.model')
const userModel = require('../models/user.model')
const configurationModel = require('../models/configuration.model');
const { notifyUpdateSummary, notifyNewSummary } = require('../helpers/summary_notifications.helper');
const ExcelJS = require('exceljs');

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        const search = req.query.search?.trim() || '';

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

        // Si hay un término de búsqueda, agregar condiciones
        if (search) {
            const regex = new RegExp(search, 'i');
            
            // Buscar usuarios cuyo nombre coincida con el término de búsqueda
            const matchingOwners = await userModel.find({ name: regex }, '_id');
            const ownerIds = matchingOwners.map(user => user._id);

            query.$or = [
                { title: regex },
                { owner: { $in: ownerIds } }
            ];
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

    //extraer usuario logueado del token
    const token = req.headers.authorization.split(' ').pop()
    const user = await verifyToken(token)
    
    // Query con filtros
    if(user.role.name == USER_ROLE) {
        const query = { deleted: false, owner: user._id };
        const totalItems = await summaryModel.countDocuments(query);
        const config = await configurationModel.findOne();
                
        if(totalItems >= config.userLimits.maxSummaries) {
            return res.status(400).send({msg: maximumAllowed(config.userLimits.maxSummaries)})
        }    
    }

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
            
            notifyNewSummary(data);

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
        }).populate('owner', ['name', 'email']).populate('creator', ['name', 'email']).populate('document_status')

        notifyUpdateSummary(data);
        
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

exportToExcel = async (req, res) => {
  try {
    // Query con filtros
    const query = { deleted: false };

    // Consulta para documentos
    const summaries = await summaryModel.find(query)
    .populate('document_status')
    .populate({
        path: 'owner',
        select: ['name', 'email'],
        populate: {
        path: 'event_participant',
        populate: [
            { path: 'participation_mode', select: 'name' },
            { path: 'owner', select: 'name' },
            { path: 'creator', select: 'name' }
        ]
        }
    })
    .populate('creator', ['name', 'email']);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Summaries');

    worksheet.columns = [
      { header: 'Grado Académico', key: 'academic_degree_name', width: 30 },
      { header: 'Nombre', key: 'user_name', width: 30 },
      { header: 'Institución', key: 'institution', width: 30 },
      { header: 'Título', key: 'title', width: 150 },
      { header: 'Correo', key: 'email', width: 50 },
      { header: 'Fecha Carga', key: 'date', width: 20 },
    ];

    summaries.forEach((summary) => {
      worksheet.addRow({
        academic_degree_name: summary.owner ? summary.owner.event_participant.academic_degree_name : 'N/A',
        user_name: summary.owner ? summary.owner.name : 'N/A',
        institution: summary.owner ? summary.owner.event_participant.institution : 'N/A',
        title: summary.title,
        email: summary.owner ? summary.owner.email : 'N/A',
        date: summary.createdAt.toISOString().split('T')[0],
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=summaries.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    res.status(500).json({ error: 'Error al generar el archivo Excel.' });
  }
};

//TODO: Obtener datos de la tabla thematic_areas o topics


module.exports = { getData, postData, updateData, deleteData, getPaymentMethods, exportToExcel }