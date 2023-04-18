const roleModel = require('../models/role.model')
const Role = require('../models/role.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await Role.find({ deleted: false, status: true })
            .limit(limite)
            .skip(desde)
            .populate('modules')

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name, status } = req.body
    const role = await new Role({ name, status }).populate('modules')
    
    try {

        //validar si existe el rol
        const roleExist = await Role.findOne({ name })
        if( roleExist) {
            return res.status(400).send({
                msg: 'El rol ya esta registrado.'
            })
        }
           
        //guardar en la BD
        await role.save()

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            role
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
    const { _id, name, modules, ...resto } = req.body
    
    try {
       
        //guardar en la BD
        const data = await roleModel.findByIdAndUpdate(id, {
            name,
            modules,
            ...resto
        }, {
            new: true
        }).populate('modules');
        
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

showData = async (req, res) => {
    const { id } = req.params

    try {
       
        //guardar en la BD
        const data = await roleModel.findById(id).populate('modules');
        
        res.send({
           msg: `Registro encontrado.`,
           data
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({
            msg: 'Error al buscar el registro',
            error
        })
    }

}

deleteData = async (req, res) => {
    
    const { id } = req.params

    try {
        //guardar como eliminado en la BD
        const data = await Role.findByIdAndUpdate(id, {
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

module.exports = { getData, showData, postData, updateData, deleteData }