const express = require("express");
const router = express.Router();
const admin = require("./admin/admin");
const employee = require("./nonAdmin/non-admin");

function isAdmin(req, res, next) {
  if (req.employee.isAdmin) next();
  else res.status(403).json({ message: "Not authorized" })
}

router.use("/admin", /*isAdmin,*/ admin);
router.use("/employee", employee);
module.exports = router;
