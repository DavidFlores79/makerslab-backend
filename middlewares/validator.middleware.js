const { validationResult } = require('express-validator')

const Validator = (req, res, next) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).send(errors)
    }
    next()

}

module.exports = { Validator }