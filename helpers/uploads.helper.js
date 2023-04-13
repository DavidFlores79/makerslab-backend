const path = require('path')
const { v4: uuidv4 } = require('uuid');

const uploadFiles = ( archivos, carpeta = '', extensionesPermitidas = ['png', 'jpg', 'jpeg', 'svg', 'gif'] ) => {

    return new Promise ( (resolve,reject) => {

        const { file0 } = archivos;

        const nombreCortado = file0.name.split('.')
        const extension = nombreCortado[nombreCortado.length - 1]
            
        //   Validar la extension      
        if( !extensionesPermitidas.includes(extension) ) {
            return reject(`La extensión ${extension} no está permitida. Sólo ${extensionesPermitidas}`)
        }
      
        const nombre = `${uuidv4()}.${extension}`
        const uploadPath =  path.join(__dirname, '../uploads/', carpeta, nombre)
      
        file0.mv(uploadPath, (err) => {
          if (err) {
            return reject(err)
          }

          resolve({ nombre, uploadPath })
      
      
        });

    
    })


  

}


module.exports = { uploadFiles }