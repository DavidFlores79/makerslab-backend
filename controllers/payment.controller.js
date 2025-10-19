const { verifyToken } = require('../helpers/jwt.helper')
const paymentMethodModel = require('../models/payment_method.model')
const paymentStatusModel = require('../models/payment_status.model')
const paymentModel = require('../models/payment.model')
const userModel = require('../models/user.model')
const configurationModel = require('../models/configuration.model')
const { USER_ROLE, PENDING_PAYMENT, maximumAllowed } = require('../config/constants')
const { notifyUpdatePayment, notifyNewPayment } = require('../helpers/payment_notifications.helper')
const ExcelJS = require('exceljs');

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        const search = req.query.search?.trim() || '';
        
        query.owner = req.user.id;
        if (search) {
            const regex = new RegExp(search, 'i');
            
            const matchingOwners = await userModel.find({ name: regex }, '_id');
            const ownerIds = matchingOwners.map(user => user._id);

            query.$or = [
                { description: regex },
                { comments: regex },
                { owner: { $in: ownerIds } }
            ];
        }

        // Consulta para documentos
        const data = await paymentModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('owner', ['name', 'email'])
            .populate('creator', ['name', 'email'])
            .populate('payment_method')
            .populate('payment_status');

        // Consulta para total de documentos
        const totalItems = await paymentModel.countDocuments(query);

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

    const { _id, image, ...resto } = req.body
    
    try {
        const payment = await new paymentModel({ ...resto })
        if (image != '') {
            payment.image = image
        }

        const paymentStatus = await paymentStatusModel.findOne({ name: PENDING_PAYMENT });
        if (!paymentStatus) {
            return res.status(400).send({ msg: 'Estatus inicial no definido' });
        }        
        //id del usuario logueado
        payment.creator = req.user.id
        //console.log(product);
        if (req.user.role.name == USER_ROLE) {
            payment.owner = req.user.id
        }
        payment.payment_status = paymentStatus._id

        //guardar en la BD
        await payment.save()

        
        const data = await paymentModel.findByIdAndUpdate(payment._id, resto, {
            new: true
        }).populate('owner', ['name', 'email'])
        .populate('creator', ['name', 'email'])
        .populate('payment_method')
        .populate('payment_status')
        
        notifyNewPayment(data);

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: data
        });


    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: 'Error al guardar el registro', error: error.message });
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, ...resto } = req.body

    try {
        
        if (req.user.role.name == USER_ROLE) {
            const paymentStatus = await paymentStatusModel.findOne({ name: PENDING_PAYMENT });
            if (!paymentStatus) {
                return res.status(400).send({ msg: 'Estatus inicial no definido' });
            }
            resto.payment_status = paymentStatus._id
        }

        //guardar en la BD
        const data = await paymentModel.findByIdAndUpdate(id, resto, {
            new: true
        })
            .populate('owner', ['name', 'email'])
            .populate('creator', ['name', 'email'])
            .populate('payment_method')
            .populate('payment_status')

        notifyUpdatePayment(data);

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

    const { limite = 0, desde = 0 } = req.query

    const data = await paymentMethodModel.find({ deleted: false })
        .populate('creator', ['name', 'email'])
        .limit(limite)
        .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

exportToExcel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 1000;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = { deleted: false };

    // Consulta para documentos
    const payments = await paymentModel.find(query)
        .limit(pageSize)
        .skip(skip)
        .populate('owner', ['name', 'email'])
        .populate('creator', ['name', 'email'])
        .populate('payment_method')
        .populate('payment_status');

    // Consulta para total de documentos
    const totalItems = await paymentModel.countDocuments(query);

    // return res.json(payments);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    worksheet.columns = [
        { header: 'Nombre', key: 'user_name', width: 40 },
        { header: 'Descripción', key: 'description', width: 50 },
        { header: 'Importe', key: 'amount', width: 20 },
        { header: 'Método Pago', key: 'payment_method', width: 20 },
        { header: 'Comentarios', key: 'comments', width: 80 },
        { header: 'Estatus', key: 'payment_status', width: 20 },
        { header: 'Fecha Pago', key: 'created_at', width: 20 },
    ];

    payments.forEach((payment) => {
        const fechaUTC = new Date(payment.createdAt);
        const fechaLocal = fechaUTC.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

      worksheet.addRow({
        user_name: payment.owner ? payment.owner.name : 'N/A',
        description: payment.description ? payment.description : 'N/A',
        amount: payment.amount ? payment.amount : 'N/A',
        payment_method: payment.payment_method ? payment.payment_method?.name : 'N/A',
        comments: payment.comments ? payment.comments : 'N/A',
        payment_status: payment.payment_status ? payment.payment_status?.name : 'N/A',
        created_at: fechaLocal,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename = Payments.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    res.status(500).json({ error: 'Error al generar el archivo Excel.' });
  }
};

module.exports = { getData, postData, updateData, deleteData, getPaymentMethods, exportToExcel }