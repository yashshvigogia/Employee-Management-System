const { LeaveRequest, Employee, User, Role } = require('../models');

// Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    // Get user information from the authenticated request
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ]
    });

    let whereClause = {};

    // If user is an employee (not admin/hr), only show their own leave requests
    if (user.role.name === 'Employee' && user.employee) {
      whereClause.employeeId = user.employee.id;
    }

    const leaveRequests = await LeaveRequest.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee' },
        { model: User, as: 'approvedBy', attributes: { exclude: ['password'] } },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error('Get all leave requests error:', error);
    res.status(500).json({
      message: 'Error getting leave requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get leave requests by employee ID
const getLeaveRequestsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leaveRequests = await LeaveRequest.findAll({
      where: { employeeId },
      include: [
        { model: Employee, as: 'employee' },
        { model: User, as: 'approvedBy', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error('Get leave requests by employee ID error:', error);
    res.status(500).json({
      message: 'Error getting leave requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get leave request by ID
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findByPk(id, {
      include: [
        { model: Employee, as: 'employee' },
        { model: User, as: 'approvedBy', attributes: { exclude: ['password'] } },
      ],
    });

    if (!leaveRequest) {
      return res.status(404).json({
        message: 'Leave request not found',
      });
    }

    res.status(200).json({ leaveRequest });
  } catch (error) {
    console.error('Get leave request by ID error:', error);
    res.status(500).json({
      message: 'Error getting leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new leave request
const createLeaveRequest = async (req, res) => {
  try {
    // Get user information from the authenticated request
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ]
    });

    let {
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: 'Missing required fields: leaveType, startDate, endDate, reason',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (start < today) {
      return res.status(400).json({
        message: 'Start date cannot be in the past',
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: 'End date must be after or equal to start date',
      });
    }

    // If user is an employee, they can only create leave requests for themselves
    if (user.role.name === 'Employee' && user.employee) {
      employeeId = user.employee.id;
    }

    // Validate employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    // Fetch the created leave request with associations
    const createdLeaveRequest = await LeaveRequest.findByPk(leaveRequest.id, {
      include: [
        { model: Employee, as: 'employee' },
      ],
    });

    res.status(201).json({
      message: 'Leave request created successfully',
      leaveRequest: createdLeaveRequest,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({
      message: 'Error creating leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a leave request
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      status,
      comments,
    } = req.body;

    const leaveRequest = await LeaveRequest.findByPk(id);

    if (!leaveRequest) {
      return res.status(404).json({
        message: 'Leave request not found',
      });
    }

    // Only allow updates to pending leave requests
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot update a leave request that has been ${leaveRequest.status.toLowerCase()}`,
      });
    }

    // Validate dates if they are being updated
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        return res.status(400).json({
          message: 'Start date cannot be in the past',
        });
      }

      if (end < start) {
        return res.status(400).json({
          message: 'End date must be after or equal to start date',
        });
      }
    }

    await leaveRequest.update({
      leaveType,
      startDate,
      endDate,
      reason,
      status,
      comments,
    });

    // Fetch updated leave request with associations
    const updatedLeaveRequest = await LeaveRequest.findByPk(id, {
      include: [
        { model: Employee, as: 'employee' },
      ],
    });

    res.status(200).json({
      message: 'Leave request updated successfully',
      leaveRequest: updatedLeaveRequest,
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({
      message: 'Error updating leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Approve or reject a leave request
const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    // Validate status
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either "Approved" or "Rejected"',
      });
    }

    const leaveRequest = await LeaveRequest.findByPk(id, {
      include: [{ model: Employee, as: 'employee' }],
    });

    if (!leaveRequest) {
      return res.status(404).json({
        message: 'Leave request not found',
      });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}`,
      });
    }

    await leaveRequest.update({
      status,
      approvedById: req.user.id,
      approvedAt: new Date(),
      comments,
    });

    // Fetch updated leave request with associations
    const updatedLeaveRequest = await LeaveRequest.findByPk(id, {
      include: [{ model: Employee, as: 'employee' }],
    });

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest: updatedLeaveRequest,
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({
      message: 'Error approving leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete a leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findByPk(id);

    if (!leaveRequest) {
      return res.status(404).json({
        message: 'Leave request not found',
      });
    }

    // Only allow deletion of pending leave requests
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot delete a leave request that has been ${leaveRequest.status.toLowerCase()}`,
      });
    }

    await leaveRequest.destroy();

    res.status(200).json({
      message: 'Leave request deleted successfully',
    });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({
      message: 'Error deleting leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllLeaveRequests,
  getLeaveRequestsByEmployeeId,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  deleteLeaveRequest,
};
