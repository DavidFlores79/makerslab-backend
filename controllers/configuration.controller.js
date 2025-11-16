const configService = require('../services/configurationService');

// Get all configurations
const getConfigurations = async (req, res) => {
    try {
        const config = await configService.getAllConfiguration();
        res.status(200).json(config);
    } catch (error) {
        console.error("Error fetching configurations:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Update configurations
const updateConfigurations = async (req, res) => {
    try {
        const updates = req.body;
        const config = await configService.updateConfiguration(updates);
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