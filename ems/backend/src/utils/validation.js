const { body, param, query } = require('express-validator');

// Auth validations
const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roleId')
    .notEmpty().withMessage('Role ID is required')
    .isUUID(4).withMessage('Invalid role ID format'),
];

const loginValidation = [
  body('username')
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Employee validations
const createEmployeeValidation = [
  body('firstName')
    .notEmpty().withMessage('First name is required'),
  body('lastName')
    .notEmpty().withMessage('Last name is required'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('hireDate')
    .notEmpty().withMessage('Hire date is required')
    .isDate().withMessage('Invalid date format'),
  body('departmentId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4).withMessage('Invalid department ID format'),
  body('managerId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4).withMessage('Invalid manager ID format'),
  body('userId')
    .optional()
    .isUUID(4).withMessage('Invalid user ID format'),
];

const updateEmployeeValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid employee ID format'),
  body('firstName')
    .optional()
    .notEmpty().withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty().withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('hireDate')
    .optional()
    .isDate().withMessage('Invalid date format'),
  body('terminationDate')
    .optional()
    .isDate().withMessage('Invalid date format'),
  body('departmentId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4).withMessage('Invalid department ID format'),
  body('managerId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4).withMessage('Invalid manager ID format'),
];

// Department validations
const createDepartmentValidation = [
  body('name')
    .notEmpty().withMessage('Department name is required'),
  body('managerId')
    .optional()
    .isUUID(4).withMessage('Invalid manager ID format'),
];

const updateDepartmentValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid department ID format'),
  body('name')
    .optional()
    .notEmpty().withMessage('Department name cannot be empty'),
  body('managerId')
    .optional()
    .isUUID(4).withMessage('Invalid manager ID format'),
];

// Role validations
const createRoleValidation = [
  body('name')
    .notEmpty().withMessage('Role name is required'),
  body('permissions')
    .optional()
    .isObject().withMessage('Permissions must be an object'),
];

const updateRoleValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid role ID format'),
  body('name')
    .optional()
    .notEmpty().withMessage('Role name cannot be empty'),
  body('permissions')
    .optional()
    .isObject().withMessage('Permissions must be an object'),
];

// Leave request validations
const createLeaveRequestValidation = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isUUID(4).withMessage('Invalid employee ID format'),
  body('leaveType')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other']).withMessage('Invalid leave type'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isDate().withMessage('Invalid date format'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isDate().withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const updateLeaveRequestValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid leave request ID format'),
  body('leaveType')
    .optional()
    .isIn(['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other']).withMessage('Invalid leave type'),
  body('startDate')
    .optional()
    .isDate().withMessage('Invalid date format'),
  body('endDate')
    .optional()
    .isDate().withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid status'),
];

const approveLeaveRequestValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid leave request ID format'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Approved', 'Rejected']).withMessage('Status must be either Approved or Rejected'),
];

// Attendance validations
const createAttendanceValidation = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isUUID(4).withMessage('Invalid employee ID format'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isDate().withMessage('Invalid date format'),
  body('checkIn')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date-time format'),
  body('checkOut')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date-time format')
    .custom((value, { req }) => {
      if (value && req.body.checkIn && new Date(value) < new Date(req.body.checkIn)) {
        throw new Error('Check-out time must be after check-in time');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Present', 'Absent', 'Late', 'Half-day', 'On Leave']).withMessage('Invalid status'),
];

const updateAttendanceValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid attendance ID format'),
  body('date')
    .optional()
    .isDate().withMessage('Invalid date format'),
  body('checkIn')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date-time format'),
  body('checkOut')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date-time format')
    .custom((value, { req }) => {
      if (value && req.body.checkIn && new Date(value) < new Date(req.body.checkIn)) {
        throw new Error('Check-out time must be after check-in time');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Present', 'Absent', 'Late', 'Half-day', 'On Leave']).withMessage('Invalid status'),
];

// ID parameter validation
const idParamValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid ID format'),
];

module.exports = {
  registerValidation,
  loginValidation,
  createEmployeeValidation,
  updateEmployeeValidation,
  createDepartmentValidation,
  updateDepartmentValidation,
  createRoleValidation,
  updateRoleValidation,
  createLeaveRequestValidation,
  updateLeaveRequestValidation,
  approveLeaveRequestValidation,
  createAttendanceValidation,
  updateAttendanceValidation,
  idParamValidation,
};
