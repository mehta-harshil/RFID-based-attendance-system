const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  moduleId: {
    type: String,
    required: true
  },
  fingerprintId: {
    type: String,
    required: true
  },
  rfid: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
