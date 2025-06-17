const { verifyToken } = require('../helpers/jwt.helper')
const categoryModel = require('../models/category.model')
const posterModel = require('../models/poster.model')
const userModel = require('../models/user.model')
const { sendNotificationEmail } = require('../helpers/email-notifications.helper')
const mongoose = require('mongoose')

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        const search = req.query.search?.trim() || '';
        const catParam = req.query.category?.trim() || '';

        // Query con filtros
        const query = { deleted: false };

 // Búsqueda por término general (name, description, authors)
        const orFilters = [];

        if (search) {
            const regex = new RegExp(search, 'i');
            orFilters.push(
                { name: regex },
                { description: regex },
                { authors: regex }
            );
        }

        // Búsqueda por categoría
        if (catParam) {
            let categoryIds = [];

            // Verificamos si es un ObjectId válido
            if (mongoose.Types.ObjectId.isValid(catParam)) {
                categoryIds.push(catParam);
            }

            // También buscamos por nombre
            const matchedCategories = await categoryModel.find({ name: new RegExp(catParam, 'i') });
            categoryIds.push(...matchedCategories.map(cat => cat._id));

            // Eliminamos duplicados
            categoryIds = [...new Set(categoryIds.map(id => id.toString()))];

            // Agregamos al filtro principal
            query.category = { $in: categoryIds };
        }

        if (orFilters.length > 0) {
            query.$or = orFilters;
        }

        // Consulta para documentos
        const data = await posterModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('user_id')
            .populate('category');

        // Consulta para total de documentos
        const totalItems = await posterModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });

    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).send({ msg: 'Error al obtener registros' });
    }
}

getHomePosters = async (req, res) => {

    const { limite = 0, desde = 0 } = req.query

    const data = await posterModel.find({ deleted: false })
        .populate('user_id', ['name', 'email'])
        .populate('category')
        .limit(limite)
        .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

getHomePostersByCategory = async (req, res) => {

    const { limite = 0, desde = 0 } = req.query
    const { category } = req.params

    const data = await posterModel.find({ deleted: false, status: true, category: category })
        .populate('user_id', ['name', 'email'])
        .populate('category')
        .limit(limite)
        .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

const getPosterById = async (req, res) => {

    const { id } = req.params

    try {
        //validar si existe el registro
        const poster = await posterModel.findOne({ deleted: false, _id: id })
            .populate('user_id', ['name', 'email'])
            .populate('category')

        if (!poster) {
            return res.status(404).send({
                msg: `Poster no encontrado.`,
            });
        }

        return res.send({
            msg: `Poster encontrado. Código: ${poster.code}.`,
            data: poster
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            msg: 'Error al leer el registro',
            error
        })
    }

}

getMyPoster = async (req, res) => {

    const { limite = 0, desde = 0 } = req.query

    try {

        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if (!tokenData) {
            return res.status(401).send({ msg: 'Su sesión ha caducado 😫' })
        }

        usuario = await userModel.findById(tokenData._id)
        if (!usuario.status || usuario.deleted || !usuario) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {
            console.log('usuario: ', usuario);
            //validar si existe el registro
            const poster = await posterModel.findOne({ deleted: false, status: true, user_id: usuario.id })
                .populate('user_id', ['name', 'email'])
                .populate('category')
                .limit(limite)
                .skip(desde)
            if (poster) {
                return res.send({
                    msg: `Poster encontrado con el código: ${poster.code}.`,
                    data: poster
                });
            } else {
                return res.status(404).send({
                    msg: `Poster no encontrado.`,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            msg: 'Error al leer el registro',
            error
        })
    }

}

postData = async (req, res) => {

    const { name, category, status, available, image, audio, authors, code, contactEmail, user_id } = req.body
    let NAME = name.toUpperCase()
    const dato = await new posterModel({ name: NAME, category: category._id, authors, status: status, available, code, contactEmail }).populate('category')

    if (image != '') {
        dato.image = image
    }

    if (audio != '') {
        dato.audio = audio
    }

    //crear el codigo del poster
    dato.code = makeid(5);

    try {

        //validar si existe el registro
        const posterExist = await posterModel.findOne({ name: NAME })
        if (posterExist) {
            return res.status(400).send({
                msg: 'El nombre ya esta registrado.'
            })
        }

        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if (!tokenData) {
            return res.status(401).send({ msg: 'Su sesión ha caducado 😫' })
        }

        usuario = await userModel.findById(tokenData._id)
        if (!usuario.status || usuario.deleted || !usuario) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {

            //id del usuario logueado
            dato.user_id = tokenData._id

            if(user_id) {
                dato.user_id = user_id
            }

            //guardar en la BD
            await dato.save();

            //populate dato
            await dato.populate('user_id', ['name', 'email']);
            
            //enviar notificación por email
            sendNotificationEmail('NUEVO CARTEL',
                `${usuario.name} ha creado el nuevo Cartel ${dato.name}.`);

            console.log(`${usuario.name} ha creado el nuevo Cartel ${dato.name}`);

        }

        res.status(201).send({
            msg: `Registro creado correctamente con el código: ${dato.code}.`,
            data: dato
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

        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if (!tokenData) {
            return res.status(401).send({ msg: 'Su sesión ha caducado 😫' })
        }

        usuario = await userModel.findById(tokenData._id)

        //guardar en la BD
        const data = await posterModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('category').populate('user_id', ['name', 'email'])

        console.log(`${usuario.name} ha modificado el nuevo Cartel ${data.name}`);

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
        const data = await posterModel.findByIdAndUpdate(id, {
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

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

getCategories = async (req, res) => {

    const { limite = 0, desde = 0 } = req.query

    const data = await categoryModel.find({ deleted: false })
        .populate('user_id', ['name', 'email'])
        .limit(limite)
        .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getCategories, getMyPoster, getHomePosters, getHomePostersByCategory, getPosterById }