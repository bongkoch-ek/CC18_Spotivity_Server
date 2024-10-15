const prisma = require("../configs/prisma")
const activityService = require("../services/activity-service")

const activityController = {}

activityController.getAllActivityList = async (req, res, next) => {
    try {
        const result = await activityService.getAllActivity()
        res.json({ result })
    } catch (error) {
        next(error)
    }
}

activityController.createActivity = async (req, res, next) => {
    try {
        const {title,description,imgUrl,startDate,endDate,amount,isUnLimit,quantity,mapName,latitude,longitude,otherType} = req.body
        
        res.json({ message : "create success" })
    } catch (error) {
        next(error)
    }
}

module.exports = activityController