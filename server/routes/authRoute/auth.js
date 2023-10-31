const express = require('express')
const {login, logout} = require("../../controllers/authController");
const router = express.Router()


router.post('/login', login)
router.delete('/logout', logout)

module.exports = router;