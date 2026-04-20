const controller = require('./backend/controllers/submitAttendance.controller');
const req = {
  method: 'GET',
  params: { moduleId: 'SSGEC_IT_6_SJA22' },
  query: { '"ids"': '["E3BE3913","A3580F0C"]' },
  // no body
};
const res = {
  status: function(s) { console.log('Status:', s); return this; },
  json: function(j) { console.log('JSON:', j); return this; }
};

// mock models
const User = require('./backend/models/User');
User.findOne = async () => ({ moduleId: 'SSGEC_IT_6_SJA22' });

const Student = require('./backend/models/Student');
Student.find = async () => [{ _id: '123', rfid: 'E3BE3913' }];

const Attendance = require('./backend/models/Attendance');
Attendance.prototype.save = async () => {};

controller.submitAttendance(req, res).then(() => console.log('done')).catch(console.error);
