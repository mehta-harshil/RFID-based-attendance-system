const express = require('express');
const router = express.Router();
const { submitAttendance } = require('../controllers/submitAttendance.controller');

// @route   POST api/submit-attendance/:moduleId
// @desc    Submit attendance from ESP32
// @access  Public
router.post('/:moduleId', submitAttendance);

module.exports = router;
