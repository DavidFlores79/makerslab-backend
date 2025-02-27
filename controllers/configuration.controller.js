const Configuration = require('../models/configuration.model');

// Get all configurations
const getConfigurations = async (req, res) => {
    try {
        const config = await Configuration.findOne();
        if (!config) {
            // If no configuration exists, create a default one
            const defaultConfig = new Configuration();
            await defaultConfig.save();
            return res.status(200).json(defaultConfig);
        }
        res.status(200).json(config);
    } catch (error) {
        console.error("Error fetching configurations:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Update configurations
const updateConfigurations = async (req, res) => {
    try {
        const updates = req.body; // Expect all fields to be updated
        const config = await Configuration.findOne();

        if (!config) {
            // If no configuration exists, create a new one
            const newConfig = new Configuration(updates);
            await newConfig.save();
            return res.status(200).json(newConfig);
        }

        // Update existing configuration
        Object.keys(updates).forEach(key => {
            config[key] = updates[key];
        });

        await config.save();
        res.status(200).json(config);
    } catch (error) {
        console.error("Error updating configurations:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    getConfigurations,
    updateConfigurations
};