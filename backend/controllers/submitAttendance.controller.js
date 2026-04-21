const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

exports.submitAttendance = async (req, res) => {
  try {
    const { moduleId } = req.params;
    let ids = req.body ? req.body.ids : undefined;

    // 1. Check if module_id specified in url exist
    const moduleExists = await User.findOne({ moduleId });
    if (!moduleExists) {
      return res.status(404).json({ message: 'Module ID does not exist.' });
    }

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid payload format. Expected { "ids": [...] }' });
    }

    if (ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided in the array.' });
    }

    // 2. Match IDs with rfid saved in database students
    // Find all students in this module whose RFID is in the provided ids array
    const matchedStudents = await Student.find({
      moduleId: moduleId,
      rfid: { $in: ids }
    });

    if (matchedStudents.length === 0) {
      return res.status(404).json({ message: 'No matching RFIDs found in the database.' });
    }

    // 3. Create one entry with time, date, day and array of id
    const now = new Date();
    
    // Formatting date as YYYY-MM-DD
    const dateStr = now.toISOString().split('T')[0];
    
    // Formatting time as HH:MM:SS
    const timeStr = now.toTimeString().split(' ')[0];
    
    // Formatting day as full weekday name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStr = days[now.getDay()];

    const presentStudentIds = matchedStudents.map(student => student.enrollmentNumber);
    const matchedRfids = matchedStudents.map(student => student.rfid);

    const newAttendance = new Attendance({
      moduleId,
      date: dateStr,
      time: timeStr,
      day: dayStr,
      presentStudents: presentStudentIds,
      rfids: matchedRfids
    });

    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance submitted successfully.',
      matchedCount: matchedStudents.length,
      attendance: newAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while submitting attendance.', error: error.message, stack: error.stack });
  }
};
