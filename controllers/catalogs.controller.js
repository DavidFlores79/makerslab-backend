const stateModel = require('../models/state.model');
const occupationModel = require('../models/occupation.model');
const eventParticipationModeModel = require('../models/event_participation_modes.model');
const paymentMethodModel = require('../models/payment_method.model');
const paymentStatusModel = require('../models/payment_status.model');


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



module.exports = { getStates, getOcuppations, getEventParticipationModes, getPaymentMethods, getPaymentStatus }