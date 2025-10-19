const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const userModel = require('../models/user.model')
const roleModel = require('../models/role.model')
const { sendNotificationEmail } = require('../helpers/email-notifications.helper')
const { USER_ROLE, SUPER_ROLE } = require('../config/constants')
const mongoose = require('mongoose'); // Importa mongoose  

getData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        const search = req.query.search?.trim() || '';

        // Query con filtros
        const query = { 
            deleted: false,
            'role.name': { $ne: SUPER_ROLE }
        };

        // Si hay un término de búsqueda, agregar condiciones
        if (search) {
            const regex = new RegExp(search, 'i'); // 'i' hace que no sea case sensitive
            query.$or = [
                { name: regex },
                { email: regex },
                // Si también quieres buscar por nombre de rol:
                { 'role.name': regex }
            ];
        }

        // Consulta para documentos
        const data = await userModel.find(query)
            .limit(pageSize)
            .skip(skip)
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

getDatum = async (req, res) => {
    const { id } = req.params
    
    try {
        // Query con filtros
        const query = { 
            deleted: false,
            'role.name': { $ne: SUPER_ROLE }
        };

        const datum = await userModel.findById(id).populate('role');

        res.send({
            data: datum
        });
        
    } catch (error) {
        res.status(500).send({ msg: 'Error al obtener registros' });
    }
}

postData = async (req, res) => {

    const { name, email, phone, password, image } = req.body
    let { role } = req.body;
    console.log('user role', role);
    
    try {
        if (!role) {
            const userRole = await roleModel.findOne({ name: USER_ROLE, status: true });
            if (!userRole) throw { status: 404, message: 'Role not found' };
            role = userRole._id;
        }

        const data = await new User({ name, email, phone, password, role }).populate('role', ['id', 'name']);
    
        if(image && image != '') {
            data.image = image
        }

        //encriptar la contraseña
        const salt = bcrypt.genSaltSync()
        data.password = bcrypt.hashSync(password, salt)
        
        //guardar en la BD
        await data.save()
        
        sendNotificationEmail('New User Created',
        `User ${data.name} has been created with role ${data.role.name}.`);

        res.status(201).send({
            msg: 'Record created successfully.',
            data
        });
        
    } catch (error) {
        res.status(error.status || 500).send({
            msg: error.message || 'Error saving record',
        });
    }
}

updateData = async (req, res) => {
    const { id } = req.params
    const { _id, password, google, ...resto } = req.body
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        if( password ) {
            //encriptar la contraseña
            const salt = bcrypt.genSaltSync()
            resto.password = bcrypt.hashSync(password, salt)
        }
        
        //guardar en la BD
        const data = await userModel.findByIdAndUpdate(id, resto, {
            new: true,
            session // Include the session
        }).populate('role', ['id', 'name']);

        await data.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.send({
           msg: `Se ha actualizado el registro`,
           data
        });
        
    } catch (error) {   
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ msg: 'Error al actualizar un registro', error: error.message });
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

    const data = await roleModel.find({ deleted: false, status: true, name: {$ne: SUPER_ROLE } })
            .limit(limite)
            .skip(desde)
            // .populate('modules')

    res.send({
        total: data.length,
        data
    })

}

module.exports = { getData, postData, updateData, deleteData, getRoles, deleteUsersExceptFirstThree, getDatum }