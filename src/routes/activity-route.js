const express = require('express')
const activityController = require('../controllers/activity-controller')
const activityRoute = express.Router()
const {authValidator} = require('../middleware/auth-validator')
const { createActivitySchema, createActivityValidator } = require('../middleware/validator')
const upload = require('../middleware/upload')
const authController = require('../controllers/auth-controller')

activityRoute.get("/", activityController.getAllActivityList)
activityRoute.post("/create" , authValidator,upload.single('image') ,activityController.createActivity)
activityRoute.patch("/edit" , authValidator,upload.single('image'), activityController.editActivity)
activityRoute.delete("/delete/:id" , authValidator , activityController.deleteActivity)

activityRoute.get("/getType", activityController.getActivityType)
activityRoute.get("/getActivityByUserId",authValidator, activityController.getActivityByUserId)

activityRoute.get("/join" , authValidator, activityController.listJoin)
activityRoute.post("/join/:id" , authValidator, activityController.joinActivity)
activityRoute.delete("/join/:id" , authValidator, activityController.cancelJoin)

activityRoute.get("/bookmark" , authValidator, activityController.listBookmark)
activityRoute.post("/bookmark/:id" , authValidator, activityController.bookmarkActivity)
activityRoute.delete("/bookmark/:id" , authValidator, activityController.cancelBookmark)

activityRoute.get("/search", activityController.searchActivity)
activityRoute.get("/search/:id", activityController.searchByType)

module.exports = activityRoute
