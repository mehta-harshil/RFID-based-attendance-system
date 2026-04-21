const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  presentStudents: [{
    type: String   // stores enrollmentNumber (e.g. "240433116003")
  }],
  rfids: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
