const createError = require("../utils/create-error")
const jwt = require('jsonwebtoken')

exports.authValidator = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization        
        if(!authHeader)
            return createError(401, "token missing")
        
        const token = authHeader.split(" ")[1]
        console.log(token)

        jwt.verify(token,process.env.SECRET,(err,decode) => {
            if(err)
                return createError(400, "token invalid")
            
            req.user = decode
        })

        next()
    } catch (err) {
        next(err)
    }
}