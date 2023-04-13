const roleModel = require('../models/role.model');
const categoryModel = require('../models/category.model');
const Role = require('../models/role.model');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');

const validateRole = async (role = '') => {
    console.log(role);
    const roleExist = await Role.findOne({ name: role })
    if(!roleExist) {
        throw new Error(`El rol ${ role } no está catalogado y no es válido.`)
    }

}

const validateUserById = async ( id ) => {
    console.log(id);
    const userExist = await userModel.findById(id)
    if(!userExist) {
        throw new Error(`El usuario con el id: ${ id } no existe en BD.`)
    }
}

const validateEmail = async (email = '', {req}) => {

    const id = req.params.id
    const existeEmail = await userModel.findOne({ email })

    //valida si el registro a actualizar es el mismo que
    //fue encontrado deja guardar el mismo valor
    if(id && existeEmail) {
        if(String(existeEmail._id) != id) {
            throw new Error(`El correo ${ email } ya está registrado.`)
        }
    } else {
        if(existeEmail) {
            throw new Error(`El correo ${ email } ya está registrado.`)
        }
    }

}

const validateLoginEmail = async (email = '', {req}) => {

    const existeEmail = await userModel.findOne({ email })

    if(!existeEmail) {
        throw new Error(`El email ${ email } no coincide con nuestros registros.`)
    }

}



const existRoleName = async (name = '', {req}) => {

    const id = req.params.id
    const existeName = await roleModel.findOne({ name })
    
    //valida si el registro a actualizar es el mismo que
    //fue encontrado deja guardar el mismo valor
    if(id && existeName) {
        if(String(existeName._id) != id) {
            throw new Error(`El rol ${ name } ya está registrado.`)
        }
    } else {
        if(existeName) {
            throw new Error(`El rol ${ name } ya está registrado.`)
        }
    }

}

const existCategoryName = async (name = '', {req}) => {

    const id = req.params.id
    const existeName = await categoryModel.findOne({ name })
    
    //valida si el registro a actualizar es el mismo que
    //fue encontrado deja guardar el mismo valor
    if(id && existeName) {
        if(String(existeName._id) != id) {
            throw new Error(`La categoría ${ name } ya está registrada.`)
        }
    } else {
        if(existeName) {
            throw new Error(`La categoría ${ name } ya está registrada.`)
        }
    }

}

const existProductName = async (name = '', {req}) => {

    const id = req.params.id
    const existeName = await productModel.findOne({ name })
    
    //valida si el registro a actualizar es el mismo que
    //fue encontrado deja guardar el mismo valor
    if(id && existeName) {
        if(String(existeName._id) != id) {
            throw new Error(`El registro ${ name } ya existe.`)
        }
    } else {
        if(existeName) {
            throw new Error(`El registro ${ name } ya existe.`)
        }
    }

}

const validateProductById = async ( id ) => {

    const dataExist = await productModel.findById(id)
    if(!dataExist) {
        throw new Error(`El registro con el id: ${ id } no existe en BD.`)
    }

}

const validateRoleById = async ( id ) => {

    const dataExist = await roleModel.findById(id)
    if(!dataExist) {
        throw new Error(`El role con el id: ${ id } no existe en BD.`)
    }

}

const validateCategoryById = async ( id ) => {

    const dataExist = await categoryModel.findById(id)
    if(!dataExist) {
        throw new Error(`La categoría con el id: ${ id } no existe en BD.`)
    }

}

const coleccionesPermitidas = ( coleccion = '', colecciones = []  ) => {
    
    //   Validar la coleccion
    if( !colecciones.includes(coleccion) ) {

        throw new Error(`La colección ${coleccion} no está permitida. Sólo ${colecciones}`)
    
    }

    return true;

}

module.exports = { 
    validateRole, 
    validateEmail, 
    validateUserById, 
    existRoleName, 
    validateRoleById, 
    validateLoginEmail, 
    existCategoryName, 
    validateCategoryById, 
    existProductName, 
    validateProductById,
    coleccionesPermitidas
}