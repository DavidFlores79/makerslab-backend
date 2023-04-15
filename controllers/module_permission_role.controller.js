const bcrypt = require('bcryptjs')
const modulePermisionRoleModel = require('../models/module_permission_role.model')

getData = async (req, res) => {

    const { limite = 0, desde = 0 } = req.query

    const data = await modulePermisionRoleModel.find({})
        .limit(limite)
        .skip(desde)
        .populate('module')
        .populate('role')
        .populate('permissions')

    res.send({
        total: data.length,
        data
    })

}

getProfile = async (req, res) => {

    const { role_id } = req.params

    const { limite = 0, desde = 0 } = req.query

    const data = await modulePermisionRoleModel.find({ role: role_id })
        .limit(limite)
        .skip(desde)
        .populate('module')
        .populate('role')
        .populate('permissions')

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { module, role, permissions } = req.body

    const data = await new modulePermisionRoleModel({ module, role, permissions })
        .populate('module')
        .populate('role')
        .populate('permissions')


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
    const { module, role, permissions } = req.body

    console.log('id', id);

    try {

        //guardar en la BD
        const data = await modulePermisionRoleModel.findByIdAndUpdate(id, {
            module,
            role,
            permissions
        }, {
            new: true
        })
            .populate('module')
            .populate('role')
            .populate('permissions')

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
        const data = await modulePermisionRoleModel.findByIdAndUpdate(id, {
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

module.exports = { getData, postData, updateData, deleteData, getProfile }