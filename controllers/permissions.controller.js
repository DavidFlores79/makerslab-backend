const permissionModel = require('../models/permission.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await permissionModel.find({ deleted: false })
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name } = req.body
    const NAME = name.toUpperCase()
    const data = await new permissionModel({ name: NAME })
    
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
    const { _id, name, ...resto } = req.body
    const NAME = name.toUpperCase()

    try {

        //guardar en la BD
        const data = await permissionModel.findByIdAndUpdate(id, {
            name: NAME,
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
        const data = await permissionModel.findByIdAndUpdate(id, {
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