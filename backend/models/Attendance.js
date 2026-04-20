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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  rfids: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
