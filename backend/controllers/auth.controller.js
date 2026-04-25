const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, adminName, username, password, moduleId, orgName } = req.body;
    
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    
    // Minimal: Save password as plain text (as requested by user)
    // Convert uploaded logo to base64 data URL (stored in MongoDB, no disk needed)
    const logoPath = req.file 
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : null;

    user = new User({ 
      email, adminName, username, password, moduleId, orgName, logoPath, role: 'admin' 
    });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('REGISTER ERROR:', error.message, error.stack);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Minimal: Check plain text password directly
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Return minimal success response
    res.json({ message: 'Login successful', user: { username: user.username, adminName: user.adminName } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Minimalistic: Set new plain text password directly
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      username: user.username,
      adminName: user.adminName,
      orgName: user.orgName,
      logoPath: user.logoPath,
      moduleId: user.moduleId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
