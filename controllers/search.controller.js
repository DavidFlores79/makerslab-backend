const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const userModel = require('../models/user.model');

const { ObjectId } = require('mongoose').Types;

const colecciones = [
    'users',
    'products',
    'products-by-category',
    'categories',
    'roles',

]

const searchUsers = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if(isMongoId) {
        const user = await userModel.findById(termino)
        res.send({
            results: (user) ?  [ user ].length : []
        })
    } else {

        const regex = new RegExp( termino, 'i' )

        const users = await userModel.find({ 
            $or: [
                {name: {$regex:regex}},
                {email: {$regex:regex}},
            ],
            $nor: [{ status: false }], //no traer los eliminados
         })
    
        return res.send({
            total: users.length,
            results: users,
    
        })
    }
}

const searchProducts = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if(isMongoId) {

        const product = await productModel.findById(termino)
        res.send({
            results: (product) ?  [ product ].length : []
        })

    } else {

        const regex = new RegExp( termino, 'i' )

        const products = await productModel.find({ 
            $or: [
                {name: {$regex:regex}},
                {description: {$regex:regex}},
                // {category: {$regex:regex}},
            ],
            $nor: [{ status: false }], //no traer los eliminados
         }).populate('category')
    
        return res.send({
            total: products.length,
            results: products,
    
        })
    }
}

const searchProductsByCategory = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if(isMongoId) {

        const product = await productModel.findById(termino)
        res.send({
            results: (product) ?  [ product ].length : []
        })

    } else {

        const regex = new RegExp( termino, 'i' )

        const categories = await categoryModel.find({ name: regex });
 
        if ( !categories.length ){
 
            return res.status(400).json({
 
                msg: `No hay resultados para ${ termino }`
 
            });
        }
        
        const products = await productModel.find({
            
 
            $or: [...categories.map( category => ({
 
                category: category._id
 
            }))],
 
            $and: [{ status: true }]

        }).populate('category');

        return res.send({
            total: products.length,
            results: products,
    
        })
    }
}

const searchCategories = async (termino, res) => {

    const isMongoId = ObjectId.isValid(termino)

    if(isMongoId) {

        const category = await categoryModel.findById(termino)
        res.send({
            results: (category) ?  [ category ].length : []
        })

    } else {

        const regex = new RegExp( termino, 'i' )

        const categories = await categoryModel.find({ 
            $or: [
                {name: {$regex:regex}},
                {description: {$regex:regex}},
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

searchData = async (req, res) => {


    const { coleccion, termino } = req.params


    if(!colecciones.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son ${colecciones}`
        })
    }

    switch (coleccion) {
        case 'users':
            return searchUsers(termino, res);
        case 'products':
            return searchProducts(termino, res)
        case 'products-by-category':
            return searchProductsByCategory(termino, res)
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

module.exports = { searchData ,searchError }