console.log('Starting server...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

console.log('Loading models...');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Disable to allow cross-origin requests
  contentSecurityPolicy: false, // Disable CSP for now to allow images
})); // Security headers with relaxed image support

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 200
})); // Enable CORS with relaxed configuration
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Add middleware to handle CORS for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Serve static files from uploads directory with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Import routes
console.log('Loading routes...');
try {
  // Load auth routes
  console.log('Loading auth routes...');
  const authRoutes = require('./routes/auth.routes');

  console.log('Loading employee routes...');
  const employeeRoutes = require('./routes/employee.routes');

  console.log('Loading leave routes...');
  const leaveRoutes = require('./routes/leave.routes');

  console.log('Loading attendance routes...');
  const attendanceRoutes = require('./routes/attendance.routes');

  console.log('Loading department routes...');
  const departmentRoutes = require('./routes/department.routes');

  console.log('Loading role routes...');
  const roleRoutes = require('./routes/role.routes');

  console.log('Loading password setup routes...');
  const passwordSetupRoutes = require('./routes/passwordSetup.routes');

  console.log('Loading profile routes...');
  const profileRoutes = require('./routes/profile.routes');

  // API routes
  console.log('Setting up API routes...');
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/password-setup', passwordSetupRoutes);
  app.use('/api/profile', profileRoutes);
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Employee Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

module.exports = app;
