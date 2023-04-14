const bcrypt = require('bcryptjs')
const moduleModel = require('../models/module.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await moduleModel.find({ deleted: false })
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name, description, route, image } = req.body
    
    let NAME = name.toUpperCase()
    let ROUTE = route.toLowerCase()
    const data = await new moduleModel({ name: NAME, description, route: ROUTE })

    if(image != '') {
        data.image = image
    }
    
    try {

        //guardar en la BD
        await data.save()

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data
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
    const { _id, name, route, ...resto } = req.body

    console.log('resto', resto);

    let NAME = name.toUpperCase()
    let ROUTE = route.toLowerCase()

    try {

        //guardar en la BD
        const data = await moduleModel.findByIdAndUpdate(id, {
            name: NAME,
            route: ROUTE,
            ...resto
        }, {
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
        const data = await moduleModel.findByIdAndUpdate(id, {
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
            error
        })
    }
}

module.exports = { getData, postData, updateData, deleteData }