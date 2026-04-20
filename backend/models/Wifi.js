const mongoose = require('mongoose');

const wifiSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true // Ensures only 1 Wi-Fi configuration per module
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Wifi', wifiSchema);
