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

    const { role_id, module_id } = req.params

    const { limite = 0, desde = 0 } = req.query

    const data = await modulePermisionRoleModel.findOne({ role: role_id, module: module_id })
        .limit(limite)
        .skip(desde)
        .populate('module')
        .populate('role')
        .populate('permissions')

    res.send({
        data
    })

}

getProfileByRole = async (req, res) => {

    const { role_id } = req.params

    const { limite = 0, desde = 0 } = req.query

    const data = await modulePermisionRoleModel.find({ role: role_id })
        .limit(limite)
        .skip(desde)
        .populate('module')
        .sort( { module: 1 } )

    res.send({
        data,
    })

}

postData = async (req, res) => {

    try {

        const { profile } = req.body

        profile.forEach( async ({ module, role, permissions }) => {
                        
            const existeProfile = await modulePermisionRoleModel.findOne({ module, role })
    
            if (existeProfile) {
                //guardar en la BD
                const data = await modulePermisionRoleModel.findOneAndUpdate({ module, role }, {
                    module,
                    role,
                    permissions
                }, {
                    new: true
                })
            } else {
    
                const data = await new modulePermisionRoleModel({ module, role, permissions }).populate('permissions', 'modules')
    
                //guardar en la BD
                await data.save()    
            }
        });

        return res.send({
            msg: `Se ha actualizado el registro`,
            // data
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

module.exports = { getData, postData, updateData, deleteData, getProfile, getProfileByRole }