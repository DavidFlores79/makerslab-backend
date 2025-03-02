const { verifyToken } = require('../helpers/jwt.helper')
const paymentMethodModel = require('../models/payment_method.model')
const paymentStatusModel = require('../models/payment_status.model')
const paymentModel = require('../models/payment.model')
const userModel = require('../models/user.model')
const configurationModel = require('../models/configuration.model')
const { USER_ROLE, PENDING_PAYMENT, maximumAllowed } = require('../config/constants')

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        // Query con filtros
        const query = { deleted: false };
        if (tokenData.role.name == USER_ROLE) {
            query.owner = tokenData._id
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
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const user = await userModel.findById(tokenData._id).populate('role');
        console.log({user});
        
        
        // Query con filtros
        if (user.role.name == USER_ROLE) {
            const query = { deleted: false, owner: user._id };
            const totalItems = await paymentModel.countDocuments(query);
            const config = await configurationModel.findOne();

            if (totalItems >= config.userLimits.maxPayments) {
                return res.status(400).send({ msg: maximumAllowed(config.userLimits.maxPayments) })
            }
        }

        const paymentStatus = await paymentStatusModel.findOne({ name: PENDING_PAYMENT });
        if (!paymentStatus) {
            return res.status(400).send({ msg: 'Estatus inicial no definido' });
        }        
        //id del usuario logueado
        payment.creator = user._id
        //console.log(product);
        if (user.role.name == USER_ROLE) {
            payment.owner = user._id
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
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        const user = await userModel.findById(tokenData._id).populate('role');
        
        if (user.role.name == USER_ROLE) {
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

module.exports = { getData, postData, updateData, deleteData, getPaymentMethods }