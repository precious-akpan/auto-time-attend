const express = require("express");
const { body } = require("express-validator");
const {
  addEmployee,
  modifyEmployee,
  report, getAllEmployees,
} = require("../../../controllers/adminController");
const router = express.Router();

router.get("/employees", getAllEmployees);
router.post(
  "/add-employee",
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name cannot be empty.")
      .isLength({ min: 3 })
      .withMessage("Minimum of 5 characters"),
    body("email").trim().not().isEmpty().normalizeEmail().isEmail(),
    body("isAdmin").not().isEmpty(),
    body("password").trim().not().isEmpty().isLength({ min: 8 }),
  ],
  addEmployee,
);
router.post(
  "/modify-employee/:employeeId",
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name cannot be empty.")
      .isLength({ min: 3 })
      .withMessage("Minimum of 3 characters"),
    body("email").trim().not().isEmpty().normalizeEmail().isEmail(),
    body("password").trim().not().isLength({ min: 8 }),
  ],
  modifyEmployee,
);
router.post("/generate-report/:employeeId", report);

module.exports = router;
