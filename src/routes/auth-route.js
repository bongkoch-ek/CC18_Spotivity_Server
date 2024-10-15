const express = require('express')
const authController = require('../controllers/auth-controller')
const { registerValidator, loginValidator } = require('../middleware/validator')
const authRoute = express.Router()

authRoute.post('/login', loginValidator, authController.login)
authRoute.post('/register', registerValidator, authController.register)

module.exports = authRoute