const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

const authService = {}

authService.getUserByUsername =  (username) => {
    try {
        return  prisma.user.findFirst({
            where: { username, },
        })

    } catch (error) {
        createError(400, error)
    }
}

authService.getUserByEmail =  (email) => {
    return prisma.user.findFirst({
        where: {
            email,
        },
    }) 
}

module.exports = authService