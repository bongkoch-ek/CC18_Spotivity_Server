const express = require('express')
const activityController = require('../controllers/activity-controller')
const activityRoute = express.Router()

activityRoute.get("/", activityController.getAllActivityList)
activityRoute.post("/create" , () => {})
activityRoute.patch("/update" , () => {})
activityRoute.delete("/delete" , () => {})

activityRoute.get("/join" , () => {})
activityRoute.post("/join" , () => {})
activityRoute.delete("/join" , () => {})

activityRoute.get("/bookmark" , () => {})
activityRoute.post("/bookmark" , () => {})
activityRoute.delete("/bookmark" , () => {})

module.exports = activityRoute
