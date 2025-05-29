const { User, Role, Employee } = require('../models');
const jwt = require('jsonwebtoken');

// Verify password setup token
const verifyPasswordSetupToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        passwordSetupToken: token,
        passwordSetupTokenExpires: {
          [require('sequelize').Op.gt]: new Date(),
        },
        isPasswordSet: false,
      },
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token',
      });
    }

    res.status(200).json({
      message: 'Token is valid',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        employee: user.employee,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify password setup token error:', error);
    res.status(500).json({
      message: 'Error verifying token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Set password for new employee
const setupPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Token, password, and confirm password are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      where: {
        passwordSetupToken: token,
        passwordSetupTokenExpires: {
          [require('sequelize').Op.gt]: new Date(),
        },
        isPasswordSet: false,
      },
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ],
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token',
      });
    }

    // Update user with new password and clear token
    // Note: The User model's beforeUpdate hook will automatically hash the password
    await user.update({
      password: password, // Pass plain text password - model hook will hash it
      isPasswordSet: true,
      passwordSetupToken: null,
      passwordSetupTokenExpires: null,
      lastLogin: new Date(),
    });

    // Generate JWT token for immediate login
    const jwtToken = jwt.sign(
      { id: user.id }, // Only include user ID, auth middleware will fetch the rest
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      message: 'Password set successfully',
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        employeeId: user.employee?.id,
        employee: user.employee,
      },
    });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({
      message: 'Error setting up password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  verifyPasswordSetupToken,
  setupPassword,
};
