const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { verifyToken, hasPermission } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { 
  createLeaveRequestValidation, 
  updateLeaveRequestValidation, 
  approveLeaveRequestValidation,
  idParamValidation 
} = require('../utils/validation');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all leave requests
router.get('/', hasPermission('leaves', 'read'), leaveController.getAllLeaveRequests);

// Get leave requests by employee ID
router.get('/employee/:employeeId', hasPermission('leaves', 'read'), leaveController.getLeaveRequestsByEmployeeId);

// Get leave request by ID
router.get('/:id', hasPermission('leaves', 'read'), idParamValidation, validate, leaveController.getLeaveRequestById);

// Create a new leave request
router.post(
  '/', 
  hasPermission('leaves', 'create'), 
  createLeaveRequestValidation, 
  validate, 
  leaveController.createLeaveRequest
);

// Update a leave request
router.put(
  '/:id', 
  hasPermission('leaves', 'update'), 
  updateLeaveRequestValidation, 
  validate, 
  leaveController.updateLeaveRequest
);

// Approve or reject a leave request
router.patch(
  '/:id/approve', 
  hasPermission('leaves', 'approve'), 
  approveLeaveRequestValidation, 
  validate, 
  leaveController.approveLeaveRequest
);

// Delete a leave request
router.delete(
  '/:id', 
  hasPermission('leaves', 'delete'), 
  idParamValidation, 
  validate, 
  leaveController.deleteLeaveRequest
);

module.exports = router;
