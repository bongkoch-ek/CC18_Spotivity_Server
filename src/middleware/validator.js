const joi = require("joi")
const createError = require("../utils/createError")

const registerSchema = joi.object({
    email: joi.string().email({ tlds: false }).required().messages(
        {
            "string.empty": "Email is required"
        }),
    password: joi.string().required().pattern(/[0-9a-zA-Z]{6,}$/).messages(
        {
            "string.empty": "Password is required",
            "string.pattern.base": "password must contain a-z A-Z 0-9 and must be at least 6 characters"
        }),
    confirmPassword: joi.string().required().valid(joi.ref("password"))
        .messages({
            "string.empty": "Confirm password",
            "any-only": "Password is not match"
        }),
    firstName: joi.string().required().messages(
        {
            "string.empty": "First name is required"
        }),
    lastName: joi.string().required().messages(
        {
            "string.empty": "Last name is required"
        }),
    username: joi.string().required().messages(
        {
            "string.empty": "Username is required"
        }
    )
})

const loginSchema = joi.object({
    username: joi.string().required().messages(
        {
            "string.empty": "Username is required"
        }),
    password: joi.string().required().messages(
        {
            "string.empty": "Password is required",
        }),
})

const createActivitySchema = joi.object({
    title: joi.string().required().messages(
        {
            "string.empty": "Title is required"
        }),
    description: joi.string().required().messages(
        {
            "string.empty": "Title is required"
        }),
    imgUrl: joi.string().required().messages(
        {
            "string.empty": "Title is required"
        }),
    startDate: joi.date().max('now').required().messages(
        {
            "string.empty": "start date is required"
        }),
    endDate: joi.date().max(joi.ref('startDate')).required().messages(
        {
            "string.empty": "start date is required"
        }),
    amount: joi.number().required().messages(
        {
            "string.empty": "start date is required"
        }), 
        // isUnLimit, quantity, mapName, latitude, longitude, otherType
})


const validateSchema = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body)
    if (error)
        return createError(400, error.details[0].message)
    req.input = value
    next()
}


exports.registerValidator = validateSchema(registerSchema)
exports.loginValidator = validateSchema(loginSchema)