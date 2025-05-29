const jwt = require('jsonwebtoken');
const { User, Role, Employee } = require('../models');
const { Op } = require('sequelize');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      roleId,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username } // Allow login with email as username
        ]
      },
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    // Check if password is valid
    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'User account is inactive',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        employeeId: user.employee ? user.employee.id : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        employee: user.employee,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Error getting user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Logout user (client-side only, just for API consistency)
const logout = (req, res) => {
  res.status(200).json({
    message: 'Logout successful',
  });
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
