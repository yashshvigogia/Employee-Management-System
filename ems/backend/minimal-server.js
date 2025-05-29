const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test login route
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      token: 'test-token-123',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin'
      }
    });
  } else {
    res.status(401).json({
      message: 'Invalid credentials'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📍 Test URL: http://localhost:${PORT}`);
  console.log(`🔐 Login URL: http://localhost:${PORT}/api/auth/login`);
});
