const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, hasRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { registerValidation, loginValidation } = require('../utils/validation');

// Register a new user
router.post('/register', registerValidation, validate, authController.register);

// Login user
router.post('/login', loginValidation, validate, authController.login);

// Get current user profile
router.get('/profile', verifyToken, authController.getProfile);

// Logout user
router.post('/logout', authController.logout);

module.exports = router;
