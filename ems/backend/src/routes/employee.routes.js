const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken, hasPermission } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { 
  createEmployeeValidation, 
  updateEmployeeValidation, 
  idParamValidation 
} = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all employees
router.get('/', hasPermission('employees', 'read'), employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', hasPermission('employees', 'read'), idParamValidation, validate, employeeController.getEmployeeById);

// Create a new employee
router.post(
  '/', 
  hasPermission('employees', 'create'), 
  createEmployeeValidation, 
  validate, 
  employeeController.createEmployee
);

// Update an employee
router.put(
  '/:id', 
  hasPermission('employees', 'update'), 
  updateEmployeeValidation, 
  validate, 
  employeeController.updateEmployee
);

// Delete an employee
router.delete(
  '/:id', 
  hasPermission('employees', 'delete'), 
  idParamValidation, 
  validate, 
  employeeController.deleteEmployee
);

module.exports = router;
