const jwt = require('jsonwebtoken')
const createError = require('../utils/createError')

exports.authValidator = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization        
        if(!authHeader)
            return createError(401, "token missing")
        
        const token = authHeader.split(" ")[1]

        jwt.verify(token,process.env.SECRET,(err,decode) => {
            if(err)
                return createError(400, "token invalid")
            
            req.user = decode.user
        })

        next()
    } catch (err) {
        next(err)
    }
}

