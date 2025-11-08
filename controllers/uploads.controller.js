const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2;
const { uploadFiles } = require('../helpers/uploads.helper');
const userModel = require('../models/user.model');
const moduleModel = require('../models/module.model');
const permissionModel = require('../models/permission.model');

// Configuration 
cloudinary.config({
  cloud_name: "dltvxi4tm",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadFile = async (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file0) {
    console.log(req.files);
    return res.status(404).send({ msg: 'No hay archivo para carga.' })
  }
  console.log("req.files >>>", req.files); // eslint-disable-line

  try {
    //   const { nombre, fullPath } = await uploadFiles(req.files, 'documents', ['txt', 'csv']);
    const { nombre, fullPath } = await uploadFiles(req.files, 'files', ['txt', 'csv']);

    res.status(201).send({
      msg: `Archivo Cargado: ${nombre}`,
      data: nombre
    })

  } catch (error) {
    console.log('error', error);
    res.status(400).send({
      msg: error
    })
  }

};

const uploadImage = async (req, res) => {

  const { coleccion, id } = req.params;

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file0) {
    return res.status(404).send({ msg: 'No hay archivo para carga.' })
  }

  // console.log("req.files >>>", req.files); // eslint-disable-line

  let modelo;
  // console.log('coleccion', coleccion);

  switch (coleccion) {
    case 'users':
      modelo = await userModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El usuario con id: ${id} no existe en la BD.` })
      }
      break;
    case 'modules':
      modelo = await moduleModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    case 'permissions':
      modelo = await permissionModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    case 'posters':
      modelo = await permissionModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    default:
      return res.status(500).send({ msg: 'Esta colección no está permitida para carga de archivos.' })
  }

  try {

    //const { nombre, uploadPath } = await uploadFiles(req.files, 'documents', ['txt', 'csv']);
    const { nombre, uploadPath } = await uploadFiles(req.files, coleccion);

    //una vez cargado el archivo puedo borrar el anterior
    if (modelo.image) {
      const pathImage = path.join(__dirname, '../uploads/', coleccion, modelo.image)
      if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage)
      }
    }

    //actualizamos el nombre en BD
    modelo.image = nombre
    modelo.save()

    res.status(201).send({
      msg: `Imagen actualizada: ${nombre}`,
      data: modelo
    })

  } catch (error) {
    res.status(400).send({
      msg: error
    })
  }

}

const uploadImageCloudinary = async (req, res) => {

  const { coleccion, id } = req.params;

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file0) {
    console.log(req.files);
    return res.status(404).send({ msg: 'No hay archivo para carga.' })
  }

  //archivo temporal que se guarda al cargar
  const { tempFilePath } = req.files.file0;
  console.log('temp', tempFilePath);

  let modelo;

  switch (coleccion) {
    case 'users':
      modelo = await userModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El usuario con id: ${id} no existe en la BD.` })
      }
      break;
    case 'modules':
      modelo = await moduleModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    case 'permissions':
      modelo = await permissionModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    case 'posters':
      modelo = await permissionModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    default:
      return res.status(500).send({ msg: 'Esta colección no está permitida para carga de archivos.' })
  }

  try {

    //una vez cargado el archivo puedo borrar el anterior
    if (modelo.image) {
      const arrayName = modelo.image.split('/')
      const name = arrayName[arrayName.length - 1]
      const [public_id] = name.split('.')
      console.log(public_id);
      cloudinary.uploader.destroy(`${coleccion}/${public_id}`)
    }

    // Upload
    const { secure_url, public_id } = await cloudinary.uploader.upload(tempFilePath, { folder: coleccion })

    //actualizamos el nombre en BD
    modelo.image = secure_url
    modelo.save()

    return res.status(201).send({
      msg: `Imagen cargada ó actualizada.`,
      data: secure_url
    })

  } catch (error) {
    res.status(500).send({
      msg: error
    })
  }

}

const uploadCloudinary = async (req, res) => {

  let { coleccion } = req.params;

  console.log('=== Upload Debug ===');
  console.log('Collection:', coleccion);
  console.log('req.files:', req.files);
  console.log('req.body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);

  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file0) {
    console.log('ERROR: No file received');
    return res.status(400).send({ 
      msg: 'No se recibió ningún archivo.',
      debug: {
        hasFiles: !!req.files,
        fileKeys: req.files ? Object.keys(req.files) : [],
        contentType: req.headers['content-type']
      }
    });
  }

  const file = req.files.file0;
  const { mimetype, size, data, tempFilePath } = file;

  console.log('File details:', { 
    name: file.name, 
    mimetype, 
    size, 
    hasTempFile: !!tempFilePath,
    hasData: !!data,
    dataSize: data ? data.length : 0
  });

  // Validate file types and sizes
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxImageSize = 10 * 1024 * 1024; // 10MB for images
  const maxAudioSize = 2 * 1024 * 1024; // 2MB for audio
  const maxPdfSize = 5 * 1024 * 1024; // 5MB for PDFs

  try {
    let options = { 
      folder: coleccion,
      resource_type: 'auto'
    };

    // Validate based on file type
    if (allowedImageTypes.includes(mimetype)) {
      if (size > maxImageSize) {
        return res.status(400).send({
          msg: `Imagen máximo 10MB. Tamaño actual: ${(size / 1024 / 1024).toFixed(2)}MB`,
        });
      }
      options.resource_type = 'image';
      
      // Optional: Add image transformations for chat images
      if (coleccion === 'chat') {
        options.transformation = [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1920, height: 1920, crop: 'limit' }
        ];
      }
    } else if (mimetype === 'audio/mpeg' || mimetype === 'audio/mp3') {
      if (size > maxAudioSize) {
        return res.status(400).send({
          msg: `Archivo de audio máximo 2MB. Tamaño actual: ${(size / 1024 / 1024).toFixed(2)}MB`,
        });
      }
      options.resource_type = 'video';
      options.folder = `${coleccion}/audios`;
    } else if (mimetype === 'application/pdf') {
      if (size > maxPdfSize) {
        return res.status(400).send({
          msg: `Archivo PDF máximo 5MB. Tamaño actual: ${(size / 1024 / 1024).toFixed(2)}MB`,
        });
      }
      options.resource_type = 'raw';
    } else {
      return res.status(400).send({
        msg: `Tipo de archivo no permitido: ${mimetype}. Permitidos: imágenes (JPG, PNG, GIF, WebP), audio (MP3), PDF`,
      });
    }

    let result;

    // If using temp files, upload from path (current config)
    if (tempFilePath) {
      console.log('Uploading from temp file:', tempFilePath);
      result = await cloudinary.uploader.upload(tempFilePath, options);
    } 
    // Otherwise upload from buffer
    else if (data) {
      console.log('Uploading from buffer, size:', data.length);
      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(data);
        });
      };
      result = await uploadFromBuffer();
    } else {
      throw new Error('No file data or temp file available');
    }

    return res.status(201).send({
      msg: `Archivo cargado exitosamente`,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).send({
      msg: 'Error al cargar archivo a Cloudinary',
      error: error.message
    });
  }

}

const showImage = async (req, res) => {

  const { coleccion, id } = req.params;

  let modelo;
  // console.log('coleccion', coleccion);

  switch (coleccion) {
    case 'users':
      modelo = await userModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El usuario con id: ${id} no existe en la BD.` })
      }
      break;
    case 'modules':
      modelo = await moduleModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    case 'permissions':
      modelo = await permissionModel.findById(id)
      if (!modelo) {
        return res.status(404).send({ msg: `El módulo con id: ${id} no existe en la BD.` })
      }
      // console.log(product);
      break;
    default:
      return res.status(500).send({ msg: 'Esta colección no está permitida para carga de archivos.' })
  }

  try {

    //si la imagen existe en el id solicitado
    if (modelo.image) {
      const pathImage = path.join(__dirname, '../uploads/', coleccion, modelo.image)
      if (fs.existsSync(pathImage)) {
        return res.sendFile(pathImage)
      }
    }

    const noImagePath = path.join(__dirname, '../assets/images/', 'no-image.png')
    return res.sendFile(noImagePath)

  } catch (error) {
    res.status(500).send({
      msg: error
    })
  }
}

module.exports = { uploadFile, uploadImage, showImage, uploadImageCloudinary, uploadCloudinary };
