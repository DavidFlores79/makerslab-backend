const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')
const { sendNotificationEmail } = require('../helpers/email-notifications.helper')
const { USER_ROLE } = require('../config/constants')

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        // Query con filtros
        const query = { 
            deleted: false,
            'role.name': { $ne: 'SUPER_ROLE' }
        };

        // Consulta para documentos
        const data = await userModel.find(query)
            .limit(pageSize)
            .skip(skip)
            .populate('event_participant')
            .populate('role');

        // Consulta para total de documentos
        const totalItems = await userModel.countDocuments(query);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener registros' });
    }
}

postData = async (req, res) => {

    const { name, email, password, image } = req.body
    let { role } = req.body;
    console.log('user role', role);
    
    try {
        if (!role) {
            const userRole = await roleModel.findOne({ name: USER_ROLE, status: true });
            if (!userRole) throw { status: 404, message: 'No se encontró el rol para dar de alta al usuario' };
            role = userRole._id;
        }
        
        const data = await new User({ name, email, password, role }).populate('role');
    
        if(image && image != '') {
            data.image = image
        }

        //encriptar la contraseña
        const salt = bcrypt.genSaltSync()
        data.password = bcrypt.hashSync(password, salt)
        
        //guardar en la BD
        await data.save()
        
        sendNotificationEmail('NUEVO USUARIO', 
        `Se ha creado al usuario ${data.name} con perfil ${data.role.name}.`);

        res.status(201).send({
            msg: 'Registro creado correctamente.',
            data
        });
        
    } catch (error) {
        console.error('Error al registrar evento:', error);
        res.status(error.status || 500).send({
            msg: error.message || 'Error al guardar el registro',
        });
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, password, google, ...resto } = req.body
    console.log('resto', resto);
    try {

        if( password ) {
            //encriptar la contraseña
            const salt = bcrypt.genSaltSync()
            resto.password = bcrypt.hashSync(password, salt)
        }
        
        //guardar en la BD
        const data = await userModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('role');

        res.send({
           msg: `Se ha actualizado el registro`,
           data
        });
        
    } catch (error) {   
        console.log(error);
        res.status(500).send({ msg: 'Error al actualizar un registro' });
    }

}

deleteData = async (req, res) => {
    
    const { id } = req.params

    try {

        //guardar como eliminado en la BD
        const data = await userModel.findByIdAndUpdate(id, {
            status: false,
            deleted: true
        }, { new: true })
        res.send({
           msg: `Se ha eliminado el registro.`,
           data
        });        
    } catch (error) {   
        console.log(error);
        res.status(500).send({ msg: 'Error al eliminar el registro' });
    }
}

const deleteUsersExceptFirstThree = async (req, res) => {
    try {
        // Get the IDs of the first 3 users
        const firstThreeUsers = await userModel.find()
            .sort({ _id: 1 }) // Sort by _id ascending (oldest first)
            .limit(3) // Limit to the first 3
            .select('_id'); // Select only the _id field

        const firstThreeIds = firstThreeUsers.map(user => user._id);

        // Delete all users except the first 3
        const result = await userModel.deleteMany({
            _id: { $nin: firstThreeIds } // Exclude the IDs of the first 3
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} users were deleted.`,
            keptUsers: firstThreeUsers
        });

    } catch (error) {
        console.error("Error deleting users:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

getRoles = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await roleModel.find({ deleted: false, status: true, name: {$ne: 'SUPER_ROLE'} })
            .limit(limite)
            .skip(desde)
            // .populate('modules')

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getRoles, deleteUsersExceptFirstThree }