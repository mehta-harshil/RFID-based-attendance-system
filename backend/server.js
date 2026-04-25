const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors({
  origin: true,        // allow any origin (we'll restrict after getting Vercel URL)
  credentials: true
}));
app.use(express.json());

// Custom Logging Middleware to print API calls and their payloads
app.use((req, res, next) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  
  // If there's a payload (body), print it
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Payload:', JSON.stringify(req.body, null, 2));
  }
  
  // Check for cookies
  if (req.headers.cookie) {
    console.log('Cookies saved on device:', req.headers.cookie);
  } else {
    console.log('no cookie send');
  }
  
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/submit-attendance', require('./routes/submitAttendance.routes'));
app.use('/api/attendance-metrics', require('./routes/attendanceMetrics.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/wifi', require('./routes/wifi.routes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
