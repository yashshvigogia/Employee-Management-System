const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { verifyToken, hasPermission } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { 
  createDepartmentValidation, 
  updateDepartmentValidation, 
  idParamValidation 
} = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all departments
router.get('/', hasPermission('departments', 'read'), departmentController.getAllDepartments);

// Get department by ID
router.get('/:id', hasPermission('departments', 'read'), idParamValidation, validate, departmentController.getDepartmentById);

// Create a new department
router.post(
  '/', 
  hasPermission('departments', 'create'), 
  createDepartmentValidation, 
  validate, 
  departmentController.createDepartment
);

// Update a department
router.put(
  '/:id', 
  hasPermission('departments', 'update'), 
  updateDepartmentValidation, 
  validate, 
  departmentController.updateDepartment
);

// Delete a department
router.delete(
  '/:id', 
  hasPermission('departments', 'delete'), 
  idParamValidation, 
  validate, 
  departmentController.deleteDepartment
);

module.exports = router;
