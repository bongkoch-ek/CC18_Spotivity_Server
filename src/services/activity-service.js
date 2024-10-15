const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

const activityService = {}

activityService.getAllActivity = () => {
    return prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

module.exports = activityService