const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Role, Employee } = require('../models');

// Simple login route without validation middleware
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    // Find user by username
    const user = await User.findOne({
      where: { username },
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

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
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
      error: error.message,
    });
  }
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth test route works!' });
});

module.exports = router;
