const moduleModel = require('../models/module.model')
const UserModuleAccess = require('../models/user_module_access.model')

getData = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;

        const search = req.query.search?.trim() || '';

        // Fetch private module IDs this user has active access to
        const userAccess = await UserModuleAccess.find({
            user: req.user._id,
            status: 'active',
            deleted: false,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        }).select('module')
        const assignedModuleIds = userAccess.map(a => a.module)

        const query = {
            status: true,
            deleted: false,
            $or: [
                { isPublic: true },
                { _id: { $in: assignedModuleIds } },
            ],
        };

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$and = [
                { $or: query.$or },
                { $or: [{ title: regex }, { description: regex }] },
            ];
            delete query.$or;
        }

        const [data, totalItems] = await Promise.all([
            moduleModel.find(query).skip(skip).limit(pageSize).sort({ priority: -1 }),
            moduleModel.countDocuments(query),
        ]);

        res.send({
            page: page,
            pageSize: pageSize,
            totalItems: totalItems,
            data: data
        });

    } catch (error) {
        res.status(500).send({ msg: 'Error getting records' });
    }

}

getDatum = async (req, res) => {
    const { id } = req.params
    
    try {
        const query = { 
            deleted: false,
        };

        const datum = await moduleModel.findById(id);

        res.send({
            data: datum
        });
        
    } catch (error) {
        res.status(error.status || 500).send({ msg: 'Error getting record' });
    }
}

postData = async (req, res) => {

    const { title, description, route, imagePath, imageUrl } = req.body

    const data = await new moduleModel({ title: title, description, route: route.toLowerCase() })

    if(imagePath != '') {
        data.image = imagePath
    }

    if(imageUrl != '') {
        data.image = imageUrl
    }
    
    try {

        //guardar en la BD
        await data.save()

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
    const { _id, title, route, ...resto } = req.body

    console.log('resto *******', resto);

    try {

        //guardar en la BD
        const data = await moduleModel.findByIdAndUpdate(id, {
            title,
            route: route.toLowerCase(),
            ...resto
        }, {
            new: true
        })

        res.send({
            msg: 'Record updated successfully.',
            data
        });
        
    } catch (error) {
        res.status(error.status || 500).send({
            msg: error.message || 'Error updating record',
        });
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
           msg: `Record deleted successfully.`,
           data
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).send({
            msg: 'Error deleting record',
            error
        })
    }
}

module.exports = { getData, getDatum, postData, updateData, deleteData }