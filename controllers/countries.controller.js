const Country = require('../models/country.model');

const getCountries = async (req, res) => {
    const { limite = 0, desde = 0, search = '' } = req.query;

    try {
        // Build query filter
        const query = { status: true };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const [total, countries] = await Promise.all([
            Country.countDocuments(query),
            Country.find(query)
                .limit(Number(limite))
                .skip(Number(desde))
                .sort({ name: 1 })
        ]);

        res.send({
            total,
            countries
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al obtener los países',
            error
        });
    }
};

const getCountryById = async (req, res) => {
    const { id } = req.params;

    try {
        const country = await Country.findOne({ _id: id, status: true });

        if (!country) {
            return res.status(404).send({
                msg: 'País no encontrado.'
            });
        }

        res.send({
            msg: 'País encontrado',
            country
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al leer el país',
            error
        });
    }
};

const getCountryByCode = async (req, res) => {
    const { code } = req.params;

    try {
        const country = await Country.findOne({ 
            code: code.toUpperCase(), 
            status: true 
        });

        if (!country) {
            return res.status(404).send({
                msg: 'País no encontrado.'
            });
        }

        res.send({
            msg: 'País encontrado',
            country
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al leer el país',
            error
        });
    }
};

const createCountry = async (req, res) => {
    const { name, code, phoneCode } = req.body;

    try {
        // Check if country already exists
        const countryExists = await Country.findOne({
            $or: [
                { name: name },
                { code: code.toUpperCase() }
            ]
        });

        if (countryExists) {
            return res.status(400).send({
                msg: 'El país ya está registrado.'
            });
        }

        const country = new Country({
            name,
            code: code.toUpperCase(),
            phoneCode
        });

        await country.save();

        res.status(201).send({
            msg: 'País creado correctamente.',
            country
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al guardar el país',
            error
        });
    }
};

const updateCountry = async (req, res) => {
    const { id } = req.params;
    const { _id, status, createdAt, updatedAt, ...resto } = req.body;

    if (resto.code) {
        resto.code = resto.code.toUpperCase();
    }

    try {
        const country = await Country.findByIdAndUpdate(id, resto, {
            new: true
        });

        if (!country) {
            return res.status(404).send({
                msg: 'País no encontrado.'
            });
        }

        res.send({
            msg: 'País actualizado correctamente',
            country
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al actualizar el país',
            error
        });
    }
};

const deleteCountry = async (req, res) => {
    const { id } = req.params;

    try {
        const country = await Country.findByIdAndUpdate(id, {
            status: false
        }, { new: true });

        if (!country) {
            return res.status(404).send({
                msg: 'País no encontrado.'
            });
        }

        res.send({
            msg: 'País eliminado correctamente.',
            country
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            msg: 'Error al eliminar el país',
            error
        });
    }
};

module.exports = {
    getCountries,
    getCountryById,
    getCountryByCode,
    createCountry,
    updateCountry,
    deleteCountry
};
