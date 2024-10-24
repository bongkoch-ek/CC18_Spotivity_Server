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
            "string.empty": "description is required"
        }),
    typeId: joi.number().required().messages(
        {
            "string.empty": "type id is required"
        }),
    startDate: joi.date().min('now').required().messages(
        {
            "string.empty": "start date is required"
        }),
    endDate: joi.date().min(joi.ref('startDate')).required().messages(
        {
            "string.empty": "end date is required"
        }),
    amount: joi.number().required().messages(
        {
            "string.empty": "amount is required"
        }),
    isUnLimit: joi.boolean(),
    mapName: joi.string().messages(
        {
            "string.empty": "mapName is required"
        }),
    latitude: joi.number().required().messages(
        {
            "string.empty": "latitude is required"
        }),
    longitude: joi.number().required().messages(
        {
            "string.empty": "longitude is required"
        }),
    otherType: joi.string().messages(
        {
            "string.empty": "mapName is required"
        }),
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
exports.createActivityValidator = validateSchema(createActivitySchema)