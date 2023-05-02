const { verifyToken } = require('../helpers/jwt.helper')
const posterModel = require('../models/poster.model')
const userModel = require('../models/user.model')

getData = async (req, res) => {

    const { limite = 0, desde= 0 } = req.query

    const data = await posterModel.find({ deleted: false, status: true })
            .populate('user_id', ['name', 'email'])
            .populate('category')
            .limit(limite)
            .skip(desde)

    res.send({
        total: data.length,
        data
    })

}

postData = async (req, res) => {

    const { name, category, status, available, image, audio, authors  } = req.body
    let NAME = name.toUpperCase()
    const dato = await new posterModel({ name: NAME, category: category._id, authors, status: status, available }).populate('category')

    if(image != '') {
        dato.image = image
    }

    if(audio != '') {
        dato.audio = audio
    }

    //crear el codigo del poster
    dato.code = makeid(5);
    
    try {

        //validar si existe el registro
        const posterExist = await posterModel.findOne({ name: NAME })
        if( posterExist) {
            return res.status(400).send({
                msg: 'El nombre ya esta registrado.'
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
            dato.user_id = tokenData._id 
            //console.log(product);

            //guardar en la BD
            await dato.save()
        }    

        res.status(201).send({
            msg: `Registro creado correctamente con el código: ${dato.code}.`,
            data: dato
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

    try {
       
        //guardar en la BD
        const data = await posterModel.findByIdAndUpdate(id, resto, {
            new: true
        }).populate('category').populate('user_id', ['name', 'email'])
        
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
        const data = await posterModel.findByIdAndUpdate(id, {
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

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = { getData, postData, updateData, deleteData }