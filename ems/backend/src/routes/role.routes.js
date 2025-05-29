const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { verifyToken, hasPermission } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { 
  createRoleValidation, 
  updateRoleValidation, 
  idParamValidation 
} = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all roles
router.get('/', hasPermission('roles', 'read'), roleController.getAllRoles);

// Get role by ID
router.get('/:id', hasPermission('roles', 'read'), idParamValidation, validate, roleController.getRoleById);

// Create a new role
router.post(
  '/', 
  hasPermission('roles', 'create'), 
  createRoleValidation, 
  validate, 
  roleController.createRole
);

// Update a role
router.put(
  '/:id', 
  hasPermission('roles', 'update'), 
  updateRoleValidation, 
  validate, 
  roleController.updateRole
);

// Delete a role
router.delete(
  '/:id', 
  hasPermission('roles', 'delete'), 
  idParamValidation, 
  validate, 
  roleController.deleteRole
);

module.exports = router;
