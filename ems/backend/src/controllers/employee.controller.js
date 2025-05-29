const { Employee, Department, User, Role } = require('../models');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: Department, as: 'department' },
        { model: Employee, as: 'manager' },
        {
          model: User,
          as: 'user',
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] }
        },
      ],
    });

    res.status(200).json({ employees });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      message: 'Error getting employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        { model: Department, as: 'department' },
        { model: Employee, as: 'manager' },
        {
          model: User,
          as: 'user',
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password'] }
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      message: 'Error getting employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, dateOfBirth, gender, position, hireDate, salary, departmentId, managerId, roleId} = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !roleId) {
      return res.status(400).json({
        message: 'First name, last name, email, and role are required',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    // Generate employee ID (e.g., EMP-001)
    const employeeCount = await Employee.count();
    const employeeId = `EMP-${(employeeCount + 1).toString().padStart(3, '0')}`;

    // Generate username from email (part before @)
    const username = email.split('@')[0];

    // Generate password setup token
    const passwordSetupToken = crypto.randomBytes(32).toString('hex');
    const passwordSetupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create user account without password (will be set via email link)
    const user = await User.create({
      username,
      email,
      password: 123456, // Initial Password
      roleId,
      isPasswordSet: false, // Password not set yet
      isActive: true,
      passwordSetupToken,
      passwordSetupTokenExpires,
    });

    // Create employee record
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      position,
      hireDate,
      salary,
      departmentId: departmentId || null,
      managerId: managerId || null,
      userId: user.id,
    });

    // Send password setup email to the new employee
    try {
      const emailResult = await emailService.sendPasswordSetupEmail(
        email,
        `${firstName} ${lastName}`,
        passwordSetupToken
      );

      console.log(`🆕 New Employee Created: ${firstName} ${lastName} (${email})`);
      console.log(`   Password setup email: ${emailResult.success ? 'Sent' : 'Failed'}`);
    } catch (emailError) {
      console.error('Failed to send password setup email:', emailError.message);
      // Don't fail the employee creation if email fails
    }

    // Fetch the complete employee data with associations
    const completeEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: Department, as: 'department' },
        { model: Employee, as: 'manager' },
        {
          model: User,
          as: 'user',
          include: [{ model: Role, as: 'role' }],
          attributes: { exclude: ['password', 'passwordSetupToken', 'passwordResetToken'] }
        },
      ],
    });

    res.status(201).json({
      message: 'Employee created successfully. Password setup email has been sent to the employee.',
      employee: completeEmployee,
      emailSent: true,
      setupInstructions: 'The employee will receive an email with instructions to set their password and access the portal.'
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      message: 'Error creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating employee with ID:', id);
    console.log('Request body:', req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      position,
      hireDate,
      terminationDate,
      salary,
      departmentId,
      managerId,
      isActive,
    } = req.body;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    await employee.update({
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      position,
      hireDate,
      terminationDate,
      salary,
      departmentId: departmentId || null,
      managerId: managerId || null,
      isActive,
    });

    res.status(200).json({
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      message: 'Error updating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    await employee.destroy();

    res.status(200).json({
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      message: 'Error deleting employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
