const prisma = require("../configs/prisma")
const activityService = require("../services/activity-service")
const createError = require("../utils/createError")
const cloudinary = require('../configs/cloundinary')
const path = require('path')
const fs = require('fs/promises')
const getPublicId = require("../utils/getPublicId")

const activityController = {}

activityController.getActivityType = async (req, res, next) => {
    try {
        const result = await prisma.activityType.findMany()
        res.json({ result })
    } catch (error) {
        next(error)
    }
}

activityController.getActivityByUserId = async (req, res, next) => {
    try {
        const result = await prisma.activity.findMany({
            where: { userId: req.user.id },
            orderBy: { startDate: 'desc' },
            include: {
                User: {
                    select: { username: true, id: true }
                },
                activityType: true,
                join: {
                    select: { userId: true }
                },
                bookmark: {
                    select: { userId: true }
                }
            }
        })
        res.json({ result })
    } catch (error) {
        next(error)
    }
}

activityController.getAllActivityList = async (req, res, next) => {
    try {
        const result = await activityService.getAllActivity()
        updateActive()
        res.json({ result })
    } catch (error) {
        next(error)
    }
}

activityController.createActivity = async (req, res, next) => {
    try {
        const { data } = req.body

        let dataObj = JSON.parse(data)
        const haveFile = !!req.file
        if (!haveFile)
            return createError(400, "image should not be null")
        let uploadResult = {}
        if (haveFile) {
            uploadResult = await cloudinary.uploader.upload(req.file.path,
                {
                    overwrite: true,
                    public_id: path.parse(req.file.path).name
                })
            fs.unlink(req.file.path)
        }

        let amount = 0
        if (dataObj.isUnLimit)
            amount = 0
        else
            amount = dataObj.amount

        const input = {
            userId: req.user.id,
            title: dataObj.title,
            description: JSON.stringify(dataObj.description),
            typeId: +dataObj.type,
            imgUrl: uploadResult.secure_url,
            startDate: new Date(dataObj.startDate),
            endDate: new Date(dataObj.endDate),
            amount: amount,
            isUnLimit: dataObj?.isUnLimit,
            mapName: dataObj?.mapName,
            latitude: dataObj?.latitude,
            longitude: dataObj?.longitude,
            otherType: dataObj?.otherType
        }

        const rs = await prisma.activity.create({ data: input })

        res.json({ message: "create success" })
    } catch (error) {
        next(error)
    }
}

activityController.editActivity = async (req, res, next) => {
    try {

        const { data } = req.body

        let dataObj = JSON.parse(data)

        const activityData = await prisma.activity.findUnique({ where: { id: dataObj.id } })
        if (!activityData || req.user.id !== activityData.userId) {
            return createError(401, "cannot Update")
        }

        //#region 
        // validate date time
        if (dataObj.startDate && dataObj.endDate) {
            if (new Date(dataObj.startDate) > new Date(dataObj.endDate))
                return createError(400, "start date should less than end date")
        }

        if (dataObj.startDate && !dataObj.endDate) {
            if (new Date(dataObj.startDate) > activityData.endDate)
                return createError(400, "start date should less than end date")
        }

        if (dataObj.endDate && !dataObj.startDate) {
            if (new Date(dataObj.endDate) < activityData.startDate)
                return createError(400, "end date should greater than start date")
        }

        // validate number
        if (dataObj.amount) {
            if (dataObj.amount < activityData.quantity)
                return createError(400, "amount should br more than joined people")
        }
        //#endregion

        const haveFile = !!req.file
        let uploadResult = {}
        if (haveFile) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: path.parse(req.file.path).name
            })
            fs.unlink(req.file.path)
            if (activityData.imgUrl) {
                cloudinary.uploader.destroy(getPublicId(activityData.imgUrl))
            }
        }
        const input = {
            userId: req.user.id,
            title: dataObj.title || activityData.title,
            description: JSON.stringify(dataObj.description) || activityData.description,
            typeId: +dataObj.type || activityData.typeId,
            imgUrl: uploadResult.secure_url || activityData.imgUrl,
            startDate: new Date(dataObj.startDate) || activityData.startDate,
            endDate: new Date(dataObj.endDate) || activityData.endDate,
            amount: dataObj.amount || activityData.amount,
            isUnLimit: dataObj.isUnLimit || activityData.isUnLimit,
            mapName: dataObj.mapName || activityData.mapName,
            latitude: dataObj.latitude || activityData.latitude,
            longitude: dataObj.longitude || activityData.longitude,
            otherType: dataObj.otherType || activityData.otherType
        }

        const rs = await prisma.activity.update({
            where:
                { id: +dataObj.id },
            data: input
        })

        res.json({ message: "update success" })
    } catch (error) {
        next(error)
    }
}

activityController.deleteActivity = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await prisma.activity.findUnique({
            where: { id: +id }
        })
        if (!data)
            return createError(400, "not found this activity")

        if (data.userId !== req.user.id) {
            return createError(401, "cannot delete")
        }
        const rs = await prisma.activity.delete({
            where: { id: +id },
        })

        res.json({ message: "delete success" })
    } catch (error) {
        next(error)
    }
}

activityController.listJoin = async (req, res, next) => {
    try {
        updateActive()

        const list = await prisma.join.findMany({
            where: { userId: req.user.id },
            include: {
                Activity: {
                    include: {
                        User: {
                            select: { username: true, id: true }
                        },
                        activityType: true,
                        join: {
                            select: { userId: true }
                        },
                        bookmark: {
                            select: { userId: true }
                        }
                    }
                }
            }
        })
        res.json({ list })
    } catch (error) {
        next(error)
    }
}

activityController.joinActivity = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await prisma.activity.findUnique({ where: { id: +id, IsActive: true } })
        if (!data) {
            return createError(401, "Cannot join this activity")
        }
        if (data.userId === req.user.id)
            return createError(400, "Cannot join your activity")

        if (data.quantity + 1 > data.amount && !data.isUnLimit)
            return createError(400, "this activity is already full")

        const isJoined = await prisma.join.findFirst({
            where: {
                activityId: +id,
                userId: req.user.id
            }
        })
        if (isJoined)
            return createError(400, "you already join this activity")

        const rs = await prisma.join.create({
            data: { activityId: +id, userId: req.user.id }
        })

        await prisma.activity.update({
            where: {
                id: +id
            },
            data: {
                quantity: data.quantity + 1
            }
        })

        res.json({ message: "success", data: { activityId: +id, userId: req.user.id } })
    } catch (error) {
        next(error)
    }
}

activityController.cancelJoin = async (req, res, next) => {
    try {
        const { id } = req.params

        const isJoined = await prisma.join.findFirst({
            where: {
                id: +id,
                userId: req.user.id
            }
        })

        const activity = await prisma.activity.findFirst({
            where: {
                id: +isJoined.activityId
            }
        })
        if (!activity)
            return createError(400, "can not cancel this activity")

        if (!isJoined)
            return createError(400, "you haven't join this activity")

        const rs = await prisma.join.delete({
            where: { id: isJoined.id }
        })
        await prisma.activity.update({
            where: {
                id: +isJoined.activityId
            },
            data: {
                quantity: activity.quantity - 1
            }
        })

        res.json({ message: "success" })
    } catch (error) {
        next(error)
    }
}

activityController.listBookmark = async (req, res, next) => {
    try {
        updateActive()
        const list = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            include: {
                Activity: {
                    include: {
                        User: {
                            select: { username: true, id: true }
                        },
                        activityType: true,
                        join: {
                            select: { userId: true }
                        },
                        bookmark: {
                            select: { userId: true }
                        }
                    }
                }
            }
        })
        res.json({ list })
    } catch (error) {
        next(error)
    }
}


activityController.bookmarkActivity = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await prisma.activity.findUnique({ where: { id: +id, IsActive: true } })
        if (!data) {
            return createError(401, "Cannot bookmark this activity")
        }
        if (data.userId === req.user.id)
            return createError(400, "Cannot bookmark your activity")

        const isBookmark = await prisma.bookmark.findFirst({
            where: {
                activityId: +id,
                userId: req.user.id
            }
        })
        if (isBookmark)
            return createError(400, "you already bookmark this activity")

        const rs = await prisma.bookmark.create({
            data: { activityId: +id, userId: req.user.id }
        })

        res.json({ message: "success", data: { activityId: +id, userId: req.user.id } })
    } catch (error) {
        next(error)
    }
}

activityController.cancelBookmark = async (req, res, next) => {
    try {
        const { id } = req.params

        const isBookmark = await prisma.bookmark.findFirst({
            where: {
                activityId: +id,
                userId: req.user.id
            }
        })

        const activity = await prisma.activity.findFirst({
            where: {
                id: +isBookmark.activityId
            }
        })
        if (!activity)
            return createError(400, "can not cancel this activity")

        if (!isBookmark)
            return createError(400, "you haven't bookmark this activity")

        const rs = await prisma.bookmark.delete({
            where: { id: isBookmark.id }
        })

        res.json({ message: "success" })
    } catch (error) {
        next(error)
    }
}

activityController.searchActivity = async (req, res, next) => {
    try {
        const searchQuery = req.query.search?.toLowerCase() || ''
        const filter = await prisma.activity.findMany({
            where: {
                title: {
                    contains: searchQuery
                },
                IsActive: true
            },
            orderBy: { createdAt: 'desc' },
            include: {
                User: {
                    select: { username: true, id: true }
                },
                activityType: true,
                join: {
                    select: { userId: true }
                },
                bookmark: {
                    select: { userId: true }
                }
            }
        })

        res.json({ result: filter })
    } catch (error) {
        next(error)
    }
}

activityController.searchByType = async (req, res, next) => {
    try {
        const {id} = req.params
        const filter = await prisma.activity.findMany({
            where: {
                typeId: +id,
                IsActive: true
            },
            orderBy: { createdAt: 'desc' },
            include: {
                User: {
                    select: { username: true, id: true }
                },
                activityType: true,
                join: {
                    select: { userId: true }
                },
                bookmark: {
                    select: { userId: true }
                }
            }
        })

        res.json({ result: filter })
    } catch (error) {
        next(error)
    }
}

const updateActive = async () => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

        const result = await prisma.activity.updateMany({
            where: {
                startDate: {
                    lt: oneHourAgo
                }
            },
            data: {
                IsActive: false
            }
        })
    } catch (error) {
        console.log(error)
    }
}


module.exports = activityController