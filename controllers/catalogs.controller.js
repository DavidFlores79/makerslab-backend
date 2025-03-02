const stateModel = require('../models/state.model');
const occupationModel = require('../models/occupation.model');
const eventParticipationModeModel = require('../models/event_participation_modes.model');
const eventParticipantModel = require('../models/event_participant.model');
const paymentMethodModel = require('../models/payment_method.model');
const paymentStatusModel = require('../models/payment_status.model');
const paymentModel = require('../models/payment.model');
const summaryModel = require('../models/summary.model');
const summaryStatusModel = require('../models/summary_status.model');
const userModel = require('../models/user.model');
const { verifyToken } = require('../helpers/jwt.helper');
const { SUPER_ROLE, ADMIN_ROLE } = require('../config/constants');


getStates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await stateModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await stateModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener Estados' });
    }
}

getOcuppations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await occupationModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await occupationModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener Ocupaciones' });
    }
}

getEventParticipationModes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await eventParticipationModeModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await eventParticipationModeModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener Modos de Participación' });
    }
}

getPaymentMethods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await paymentMethodModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await paymentMethodModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener los registros' });
    }
}

getPaymentStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await paymentStatusModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await paymentStatusModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener los registros' });
    }
}

getSummaryStatuses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await summaryStatusModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('creator')

        // Consulta para total de documentos
        const totalItems = await summaryStatusModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener los registros' });
    }
}

getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
        };

        // Consulta para documentos
        const data = await userModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('event_participant')
            .populate('role');

        // Filtra en memoria
        dataFiltered = data.filter(user => user.role?.name !== SUPER_ROLE && user.role?.name !== ADMIN_ROLE);
        // Consulta para total de documentos
        const totalItems = dataFiltered.lenght;

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: dataFiltered
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener registros' });
    }
}

getUserDashboard = async (req, res) => {

    const { id } = req.params
    
    try {

        // Query con filtros
        const query = { 
            deleted: false,
            owner: id
        };

        // Consulta para documentos
        const data = await paymentModel.find(query);

        // Consulta para total de resumenes
        const summary = await summaryModel.findOne(query).populate('document_status');

        const totalAmount = data.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        res.send({
            payments: {
                total: data.length,
                totalAmount: totalAmount,
            },
            summary: {
                exist: summary !== null,
                percentage: summary ? summary.document_status.name.includes('CARGADO') ? 50 : 100 : 0,
                data: summary,
            }

        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener los registros' });
    }
}

getUserInfo = async (req, res) => {
    const { id } = req.params
    
    try {
        // Consulta para documentos
        const data = await userModel.findById(id).populate('role');

        const eventInfo = await eventParticipantModel.findById(data.event_participant)
                    .populate('occupation', ['name'])
                    .populate('participation_mode', ['name'])
                    .populate('state', ['name']);
        data.event_participant = eventInfo;

        res.send({ data: data });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener los registros' });
    }
}



module.exports = { getUsers, getStates, getOcuppations, getEventParticipationModes, getPaymentMethods, getPaymentStatus, getUserDashboard, getUserInfo, getSummaryStatuses }