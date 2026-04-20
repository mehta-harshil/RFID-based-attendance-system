const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { studentId, status } = req.body;
    
    // Simplistic logic for boilerplate
    const newAttendance = new Attendance({
      studentId,
      status
    });
    
    const attendance = await newAttendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate('studentId', ['name', 'email']);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
