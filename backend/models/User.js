const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  moduleId: {
    type: String,
    required: true,
  },
  orgName: {
    type: String,
    required: true,
  },
  logoPath: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'faculty'],
    default: 'admin',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
