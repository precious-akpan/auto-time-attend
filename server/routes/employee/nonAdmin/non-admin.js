const express = require('express')
const router = express.Router()
const {clockIn, clockOut, startBreak, endBreak} = require('../../../controllers/nonAdminController')

router.post('/clock-in', clockIn)
router.post('/clock-out', clockOut)
router.post('/start-break', startBreak)
router.post('/end-break', endBreak)

module.exports = router;