const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const multer = require('multer');
const path = require('path');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});
const upload = multer({ storage: storage });

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('logo'), authController.register);

// @route   GET api/auth/check/:username
// @desc    Check if user exists for cookie validation
// @access  Public
router.get('/check/:username', authController.checkUser);

// @route   GET api/auth/profile/:username
// @desc    Get user profile data
// @access  Public
router.get('/profile/:username', authController.getProfile);

// @route   POST api/auth/reset-password
// @desc    Reset password (minimalist direct reset)
// @access  Public
router.post('/reset-password', authController.resetPassword);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

module.exports = router;
