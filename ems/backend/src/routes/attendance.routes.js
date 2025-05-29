const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken, hasPermission } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { 
  createAttendanceValidation, 
  updateAttendanceValidation, 
  idParamValidation 
} = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all attendance records
router.get('/', hasPermission('attendance', 'read'), attendanceController.getAllAttendances);

// Get attendance statistics
router.get('/stats', hasPermission('attendance', 'read'), attendanceController.getAttendanceStats);

// Get attendance records by employee ID
router.get('/employee/:employeeId', hasPermission('attendance', 'read'), attendanceController.getAttendancesByEmployeeId);

// Get attendance record by ID
router.get('/:id', hasPermission('attendance', 'read'), idParamValidation, validate, attendanceController.getAttendanceById);

// Create a new attendance record
router.post(
  '/', 
  hasPermission('attendance', 'create'), 
  createAttendanceValidation, 
  validate, 
  attendanceController.createAttendance
);

// Update an attendance record
router.put(
  '/:id', 
  hasPermission('attendance', 'update'), 
  updateAttendanceValidation, 
  validate, 
  attendanceController.updateAttendance
);

// Delete an attendance record
router.delete(
  '/:id', 
  hasPermission('attendance', 'delete'), 
  idParamValidation, 
  validate, 
  attendanceController.deleteAttendance
);

module.exports = router;
