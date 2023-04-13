const { verifyToken } = require('../helpers/jwt.helper')
const categoryModel = require('../models/category.model')
const Category = require('../models/category.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await categoryModel.find({ deleted: false, status: true })
            .populate('user_id', ['name', 'email'])
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name  } = req.body
    let NAME = name.toUpperCase()
    const category = await new categoryModel({ name: NAME })
    
    try {

        //validar si existe La categoría
        const categoryExist = await categoryModel.findOne({ name: NAME })
        if( categoryExist) {
            return res.status(400).send({
                msg: 'La categoría ya esta registrada.'
            })
        }
        
        //extraer usuario logueado del token
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)

        if(!tokenData) {
            return res.status(401).send({msg: 'Token no válido. *'})
        }
    
        usuario = await userModel.findById(tokenData._id)
        if(!usuario.status || usuario.deleted || !usuario) {
            res.status(401).send({ msg: 'Usuario Bloqueado. Sin Permisos' })
            console.log('Usuario Bloqueado. Sin Permisos');
        } else {

            //id del usuario logueado
            category.user_id = tokenData._id 
            //console.log(category);

            //guardar en la BD
            await category.save()
        }    

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data: category
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
    resto.name = resto.name.toUpperCase()

    try {
       
        //guardar en la BD
        const data = await categoryModel.findByIdAndUpdate(id, resto, {
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
        const data = await categoryModel.findByIdAndUpdate(id, {
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