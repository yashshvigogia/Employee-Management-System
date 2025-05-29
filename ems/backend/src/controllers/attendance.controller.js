const { Attendance, Employee, User, Role } = require('../models');
const { Op } = require('sequelize');

// Get all attendance records
const getAllAttendances = async (req, res) => {
  try {
    // Get user information from the authenticated request
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ]
    });

    let whereClause = {};

    // If user is an employee (not admin/hr), only show their own attendance
    if (user.role.name === 'Employee' && user.employee) {
      whereClause.employeeId = user.employee.id;
    }

    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee' },
      ],
      order: [['date', 'DESC']],
    });

    res.status(200).json({ attendances });
  } catch (error) {
    console.error('Get all attendances error:', error);
    res.status(500).json({
      message: 'Error getting attendance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get attendance records by employee ID
const getAttendancesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    let whereClause = { employeeId };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        { model: Employee, as: 'employee' },
      ],
      order: [['date', 'DESC']],
    });

    res.status(200).json({ attendances });
  } catch (error) {
    console.error('Get attendances by employee ID error:', error);
    res.status(500).json({
      message: 'Error getting attendance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get attendance record by ID
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id, {
      include: [
        { model: Employee, as: 'employee' },
      ],
    });

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({ attendance });
  } catch (error) {
    console.error('Get attendance by ID error:', error);
    res.status(500).json({
      message: 'Error getting attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new attendance record
const createAttendance = async (req, res) => {
  try {
    console.log('Creating attendance record with data:', req.body);

    // Get user information from the authenticated request
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ]
    });

    let {
      employeeId,
      date,
      checkIn,
      checkOut,
      status,
      notes,
    } = req.body;

    // If user is an employee, they can only create attendance for themselves
    if (user.role.name === 'Employee' && user.employee) {
      employeeId = user.employee.id;
    }

    // Check if attendance record already exists for this employee and date
    const existingAttendance = await Attendance.findOne({
      where: {
        employeeId,
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance record already exists for this employee and date',
      });
    }

    // Calculate work hours if both check-in and check-out are provided
    let workHours = null;
    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn).getTime();
      const checkOutTime = new Date(checkOut).getTime();
      workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    const attendance = await Attendance.create({
      employeeId,
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status,
      workHours,
      notes,
    });

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance,
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      message: 'Error creating attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update an attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      checkIn,
      checkOut,
      status,
      notes,
    } = req.body;

    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
      });
    }

    // Calculate work hours if both check-in and check-out are provided
    let workHours = null;
    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn).getTime();
      const checkOutTime = new Date(checkOut).getTime();
      workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    await attendance.update({
      date: date ? new Date(date) : attendance.date,
      checkIn: checkIn ? new Date(checkIn) : attendance.checkIn,
      checkOut: checkOut ? new Date(checkOut) : attendance.checkOut,
      status: status || attendance.status,
      workHours,
      notes,
    });

    res.status(200).json({
      message: 'Attendance record updated successfully',
      attendance,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      message: 'Error updating attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete an attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
      });
    }

    await attendance.destroy();

    res.status(200).json({
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      message: 'Error deleting attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    let whereClause = {};
    let employeeWhereClause = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Add department filter if provided
    if (departmentId) {
      employeeWhereClause.departmentId = departmentId;
    }

    // Get attendance counts by status
    const statusCounts = await Attendance.findAll({
      attributes: [
        'status',
        [Attendance.sequelize.fn('COUNT', Attendance.sequelize.col('status')), 'count'],
      ],
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          where: employeeWhereClause,
          attributes: [],
        },
      ],
      group: ['status'],
    });

    // Format the results
    const stats = {
      total: statusCounts.reduce((sum, item) => sum + parseInt(item.dataValues.count), 0),
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      message: 'Error getting attendance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllAttendances,
  getAttendancesByEmployeeId,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
};
