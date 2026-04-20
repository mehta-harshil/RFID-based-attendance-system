const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// @route   POST api/student/add
// @desc    Add a new student
// @access  Public
router.post('/add', studentController.addStudent);

// @route   GET api/student/list/:moduleId
// @desc    Get all students for a module
// @access  Public
router.get('/list/:moduleId', studentController.getStudents);

// @route   DELETE api/student/delete/:moduleId/:enrollmentNumber
// @desc    Delete a student
// @access  Public
router.delete('/delete/:moduleId/:enrollmentNumber', studentController.deleteStudent);

module.exports = router;
