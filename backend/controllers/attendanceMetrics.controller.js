const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// GET /api/attendance-metrics/:moduleId?startDate=&endDate=&enrollments=&minPercent=&filterStudents=&sortBy=
exports.getAttendanceMetrics = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { startDate, endDate, enrollments, minPercent, filterStudents, sortBy } = req.query;

    // 1. Build attendance date filter
    const attendanceFilter = { moduleId };
    if (startDate || endDate) {
      attendanceFilter.date = {};
      if (startDate) attendanceFilter.date.$gte = startDate;
      if (endDate)   attendanceFilter.date.$lte = endDate;
    }

    // 2. Fetch all attendance sessions in range for this module
    const sessions = await Attendance.find(attendanceFilter).sort({ date: 1 });

    if (sessions.length === 0) {
      return res.json({ dates: [], students: [], totalSessions: 0 });
    }

    // 3. Collect all unique dates (columns)
    const dateSet = [...new Set(sessions.map(s => s.date))];

    // 4. Build a map: date -> set of present enrollmentNumbers
    const dateToPresent = {};
    for (const s of sessions) {
      if (!dateToPresent[s.date]) dateToPresent[s.date] = new Set();
      s.presentStudents.forEach(en => dateToPresent[s.date].add(en));
    }

    // 5. Fetch all students in this module
    let studentQuery = { moduleId };
    if (enrollments) {
      const enList = enrollments.split(',').map(e => e.trim()).filter(Boolean);
      if (enList.length > 0) studentQuery.enrollmentNumber = { $in: enList };
    }
    let students = await Student.find(studentQuery).lean();

    // 6. Build per-student attendance row
    const totalSessions = dateSet.length;
    let rows = students.map(student => {
      const en = student.enrollmentNumber;
      const dailyStatus = dateSet.map(date =>
        dateToPresent[date] && dateToPresent[date].has(en) ? 'P' : 'A'
      );
      const presentCount = dailyStatus.filter(s => s === 'P').length;
      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
      return {
        enrollmentNumber: student.enrollmentNumber,
        name: student.name,
        dailyStatus,
        presentCount,
        absentCount: totalSessions - presentCount,
        percentage
      };
    });

    // 7. Apply minPercent filter
    if (minPercent) {
      rows = rows.filter(r => r.percentage >= parseInt(minPercent));
    }

    // 8. Apply filterStudents (present/absent)
    if (filterStudents === 'present') {
      rows = rows.filter(r => r.percentage > 0);
    } else if (filterStudents === 'absent') {
      rows = rows.filter(r => r.percentage === 0);
    } else if (filterStudents === 'below75') {
      rows = rows.filter(r => r.percentage < 75);
    }

    // 9. Sort
    if (sortBy === 'asc') {
      rows.sort((a, b) => a.percentage - b.percentage);
    } else if (sortBy === 'desc') {
      rows.sort((a, b) => b.percentage - a.percentage);
    }

    res.json({ dates: dateSet, students: rows, totalSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching attendance metrics.', error: error.message });
  }
};

// GET /api/attendance-metrics/:moduleId/logs
exports.getAttendanceLogs = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const sessions = await Attendance.find({ moduleId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching logs.', error: error.message });
  }
};
