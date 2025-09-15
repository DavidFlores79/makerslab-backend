const categoryModel = require('../models/category.model');
const userModel = require('../models/user.model');
const { SUPER_ROLE } = require('../config/constants');

const { ObjectId } = require('mongoose').Types;

const colecciones = [
    'users',
    'categories',
    'roles',

]

const searchCollection = async (req, res) => {

    try {
        const { query } = req.body; // Obtén la consulta del cuerpo de la solicitud

        console.log(query);
        

        if (!query) {
            return res.status(400).json({
                success: false,
                msg: "El parámetro 'query' es requerido."
            });
        }

        // Buscar coincidencias en nombre y email, excluyendo SUPER_USER
        const usuarios = await userModel.find({
            $and: [
                {
                    $or: [
                        { nombre: { $regex: query, $options: 'i' } }, // Búsqueda insensible a mayúsculas/minúsculas
                        { email: { $regex: query, $options: 'i' } }
                    ]
                },
                { 'role.name': { $ne: SUPER_ROLE } } // Excluir usuarios con role.name SUPER_USER
            ]
        }).select('-password'); // Excluir el campo password de los resultados

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No se encontraron coincidencias.",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            data: usuarios
        });

    } catch (error) {
        console.error("Error en la búsqueda de usuarios:", error);
        res.status(500).json({
            success: false,
            msg: "Error interno del servidor."
        });
    }
}

const searchUsers = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if (isMongoId) {
        const user = await userModel.findById(termino)
        res.send({
            results: (user) ? [user].length : []
        })
    } else {

        const regex = new RegExp(termino, 'i')

        const users = await userModel.find({
            $or: [
                { name: { $regex: regex } },
                { email: { $regex: regex } },
            ],
            $nor: [{ status: false }], //no traer los eliminados
        })

        return res.send({
            total: users.length,
            results: users,

        })
    }
}


const searchCategories = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if (isMongoId) {

        const category = await categoryModel.findById(termino)
        res.send({
            results: (category) ? [category].length : []
        })

    } else {

        const regex = new RegExp(termino, 'i')

        const categories = await categoryModel.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                // {category: {$regex:regex}},
            ],
            $nor: [{ status: false }], //no traer los eliminados
        })

        return res.send({
            total: categories.length,
            results: categories,

        })
    }
}

const searchData = async (req, res) => {

    const { coleccion, termino } = req.params


    if (!colecciones.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son ${colecciones}`
        })
    }

    switch (coleccion) {
        case 'users':
            return searchUsers(termino, res);
        case 'categories':
            return searchCategories(termino, res)
        case 'roles':

            break;

        default:
            return res.status(500).json({
                msg: `Esta opcion no esta contemplada.`
            })
    }

    res.status(500).send({
        msg: 'Error desconocido!',
    })

}

searchError = async (req, res) => {
    res.status(500).send({
        msg: 'Debes especificar una categoría y un término a buscar!',
    })
}

module.exports = { searchData, searchError, searchCollection }