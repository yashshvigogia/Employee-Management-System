const express = require('express');
const router = express.Router();
const { verifyPasswordSetupToken, setupPassword } = require('../controllers/passwordSetup.controller');

// Verify password setup token
router.get('/verify/:token', verifyPasswordSetupToken);

// Set password for new employee
router.post('/setup', setupPassword);

module.exports = router;
