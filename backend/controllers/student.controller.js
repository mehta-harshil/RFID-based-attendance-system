const Student = require('../models/Student');

exports.addStudent = async (req, res) => {
  try {
    const { enrollmentNumber, name, email, gender, moduleId, rfid } = req.body;
    
    if (!enrollmentNumber || enrollmentNumber.length < 2) {
        return res.status(400).json({ message: 'Enrollment number must be at least 2 digits.' });
    }

    if (!rfid) {
        return res.status(400).json({ message: 'RFID is required.' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    let existingStudent = await Student.findOne({ enrollmentNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this enrollment number already exists.' });
    }

    // Generate fingerprintId from last 2 digits of enrollment number
    const fingerprintId = enrollmentNumber.slice(-2);
    
    const student = new Student({ enrollmentNumber, name, email, gender, moduleId, fingerprintId, rfid });
    await student.save();
    
    res.status(201).json({ message: 'Student added successfully!', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding student.' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const students = await Student.find({ moduleId }).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching students.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { enrollmentNumber, moduleId } = req.params;
    
    const student = await Student.findOneAndDelete({ enrollmentNumber, moduleId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found or does not belong to this module.' });
    }
    
    res.json({ message: 'Student deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting student.' });
  }
};
