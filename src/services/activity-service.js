const prisma = require("../configs/prisma")
const createError = require("../utils/createError")

const activityService = {}

activityService.getAllActivity = () => {
    return prisma.activity.findMany({
        where: { IsActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
            User: {
                select: { username: true, id: true }
            },
            activityType: true,
            join: {
                include:{
                    User:{
                        select: { username: true, id: true }
                    }
                }
            },
            bookmark: {
                select: { userId: true }
            }
        }
    })
}

module.exports = activityService