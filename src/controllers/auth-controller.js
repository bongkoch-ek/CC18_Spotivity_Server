const prisma = require("../configs/prisma")
const authService = require("../services/auth-service")
const createError = require("../utils/createError")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const authController = {}

authController.login = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await authService.getUserByUsername(username)
        if (!user)
            return createError(400, "username doesn't exist")

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return createError(400, "password not match")
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        }

        const genToken = jwt.sign(payload, process.env.SECRET, { expiresIn: "30 d" })

        res.json({ user: payload.user, token: genToken, message: 'login success' })
    } catch (error) {
        next(error)
    }
}

authController.register = async (req, res, next) => {
    try {

        const { email, username, password, confirmPassword, firstName, lastName } = req.body

        //#region validator
        const isUserExist = await authService.getUserByEmail(email)
        if (isUserExist) return createError(400, "Email already exist")

        const isUsernameExist = await authService.getUserByUsername(username)
        if (isUsernameExist) return createError(400, "Username already exist")
        //#endregion

        const hashPassword = await bcrypt.hash(password, 10)

        //register
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashPassword,
                username,
                firstName,
                lastName
            }
        })

        res.json({ message: 'register success', errorCode: "0000" })
    } catch (error) {
        next(error)
    }
}

module.exports = authController