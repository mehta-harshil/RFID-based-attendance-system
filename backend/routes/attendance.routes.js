const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

// @route   POST api/attendance
// @desc    Mark attendance
// @access  Public (should be protected in real app)
router.post('/', attendanceController.markAttendance);

// @route   GET api/attendance
// @desc    Get all attendance records
// @access  Public
router.get('/', attendanceController.getAttendance);

module.exports = router;
