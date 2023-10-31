const Employee = require("../models/employee.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      const error = new Error("Employee not found.");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: employee.email,
        employeeId: employee._id,
        isAdmin: employee.isAdmin,
      },
      "supersecretsecretkey",
      { expiresIn: "1h" },
    );
    req.employee = employee;
    return res.status(200).json({
      message: "Login successful",
      token,
      employeeId: employee._id,
    });
  } catch (e) {
    e.statusCode = e.statusCode || 500;
    next(e);
  }
};

/**
 * Logout the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object} The response object with a success message.
 */
exports.logout = async (req, res, next) => {
  try {
    req.employee = null;
    req.isAuth = false;
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};
