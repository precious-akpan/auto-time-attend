const express = require("express");
require("mongoose");
const helmet = require("helmet");
const morgan = require('morgan')
const app = express();
app.use(helmet());


require("dotenv").config();

const { join } = require("path");
app.use(express.json());
app.use(express.urlencoded({ urlencoded: false, extended: true }));
const employeeRoutes = require("../routes/employee/employees");
const authentication = require('../routes/authRoute/auth')


app.use(morgan('combined'))


app.use("/auth", authentication);
app.use("/v1", employeeRoutes);

app.use("/", (req, res) => {
    res.sendFile(join(__dirname, "../public/index.html"));
})

app.use((error, req, res, next) => {
  console.log(error);
    res
    .status(error.statusCode || 500)
    .json({ message: "Internal server error occurred", data: error.message });
});

module.exports = app
