const express = require("express");
require("mongoose");
const helmet = require("helmet");
const app = express();
app.use(helmet());
require("dotenv").config();

const { join } = require("path");
app.use(express.json());
app.use(express.urlencoded({ urlencoded: false, extended: true }));
const auth = require("../middleware/auth");
const employeeRoutes = require("../routes/employee/employees");
const authentication = require('../routes/authRoute/auth')
const Employee = require('../models/employee.model')


// app.use(auth)

//todo: clean up this code before submission
app.use(async (req, res, next) => {
    req.employee = await Employee.findById('6528a845411a6ab5c2eb9278')
    next()
})


app.use("/auth", authentication);
app.use("/v1", employeeRoutes);

app.use("/", (req, res,next) => {
    res.sendFile(join(__dirname, "../public/index.html"));
})

app.use((error, req, res, next) => {
  console.log(error);
    res
    .status(error.statusCode || 500)
    .json({ message: "Internal server error occurred", data: error.message });
});

module.exports = app
