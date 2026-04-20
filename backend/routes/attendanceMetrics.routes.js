const express = require('express');
const router = express.Router();
const { getAttendanceMetrics, getAttendanceLogs } = require('../controllers/attendanceMetrics.controller');

// GET /api/attendance-metrics/:moduleId        - full matrix with filters
router.get('/:moduleId', getAttendanceMetrics);

// GET /api/attendance-metrics/:moduleId/logs   - raw session logs
router.get('/:moduleId/logs', getAttendanceLogs);

module.exports = router;
