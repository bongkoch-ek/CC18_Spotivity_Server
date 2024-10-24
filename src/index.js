const express = require('express');
const authRoute = require('./routes/auth-route');
const handleError = require('./middleware/handleError');
const notFoundHandler = require('./middleware/not-found');
const activityRoute = require('./routes/activity-route');
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json())

app.use("/auth", authRoute)
app.use("/activity", activityRoute)

app.use(handleError)
app.use(notFoundHandler)
app.listen(8000, () => console.log("hello world"))