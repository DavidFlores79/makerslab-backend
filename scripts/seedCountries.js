require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('../models/country.model');
const countriesData = require('../uploads/countries.json');

const seedCountries = async () => {
    try {
        // Connect to MongoDB
        const DB_URI = process.env.MONGODB;
        mongoose.set('strictQuery', false);
        await mongoose.connect(DB_URI);
        console.log('✅ Conectado a MongoDB');

        // Check if countries already exist
        const existingCount = await Country.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Ya existen ${existingCount} países en la base de datos.`);
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            readline.question('¿Deseas eliminar todos los países existentes y cargar nuevamente? (s/n): ', async (answer) => {
                if (answer.toLowerCase() === 's') {
                    await Country.deleteMany({});
                    console.log('🗑️  Países eliminados');
                    await insertCountries();
                } else {
                    console.log('❌ Operación cancelada');
                    process.exit(0);
                }
                readline.close();
            });
        } else {
            await insertCountries();
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

const insertCountries = async () => {
    try {
        // Transform data from JSON format to model format
        const countries = countriesData.docs.map(country => ({
            name: country.name,
            code: country.code.toUpperCase(),
            phoneCode: country.phoneCode,
            status: true
        }));

        // Insert countries
        const result = await Country.insertMany(countries);
        console.log(`✅ Se han insertado ${result.length} países correctamente`);
        
        // Show some examples
        console.log('\n📋 Primeros 5 países insertados:');
        result.slice(0, 5).forEach(country => {
            console.log(`   - ${country.name} (${country.code}): +${country.phoneCode}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al insertar países:', error);
        process.exit(1);
    }
};

// Run the seed script
seedCountries();
