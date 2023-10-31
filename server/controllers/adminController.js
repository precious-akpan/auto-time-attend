const bcrypt = require("bcryptjs");
const Employee = require("../models/employee.model");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { generateReport } = require("../utils/generateReport");

/**
 * Get all employees
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find();
    return res.json({ message: "Employees fetched", employees });
  } catch (error) {
    return next(error);
  }
};
/**
 * Adds an employee to the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object} The response object with a message and the newly added employee.
 */
exports.addEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw Error(`Validation failed, ${errors.array()[0].msg}`);
    }

    const { name, email, phone, password, isAdmin } = req.body;
    const { employeeId } = req.employee;
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const employee = new Employee({
      name,
      email,
      phone,
      isAdmin,
      createdBy: employeeId,
      password: hashedPassword,
    });
    await employee.save();
    return res
      .status(200)
      .json({ message: "Employee added"});
  } catch (error) {
    console.error(error);
    error.statusCode = 500;
    next(error);
  }
};

exports.modifyEmployee = async (req, res, next) => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect!");
      error.statusCode = 422;
      throw error;
    }
    const { employeeId } = req.params;
    const { name, email, phone } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }
    employee.name = name;
    employee.email = email;
    employee.phone = phone;
    const result = await employee.save();
    res.status(200).json({ message: "Employee updated", employee: result });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

exports.report = async (req, res, next) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const timeAttendanceReport = generateReport(employee.timeAttendance);

    res
      .status(200)
      .json({ message: "Report generated", report: timeAttendanceReport });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};
