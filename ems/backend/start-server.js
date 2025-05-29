console.log('🚀 Starting Employee Management System Backend...\n');

// Load environment variables
require('dotenv').config();

console.log('📋 Environment Configuration:');
console.log(`  - Port: ${process.env.PORT || 5000}`);
console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  - Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`  - JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not Set'}`);
console.log(`  - Email: ${process.env.SMTP_USER ? 'Configured' : 'Not Configured'}\n`);

// Test database connection first
const { sequelize } = require('./src/models');

async function startServer() {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!\n');

    // Start the server
    console.log('🌐 Starting Express server...');
    const app = require('./src/server');
    
    console.log('✅ Server started successfully!');
    console.log(`🔗 API available at: http://localhost:${process.env.PORT || 5000}/api`);
    console.log('📚 Available endpoints:');
    console.log('  - POST /api/auth/login');
    console.log('  - GET  /api/employees');
    console.log('  - GET  /api/roles');
    console.log('  - GET  /api/departments\n');
    
  } catch (error) {
    console.error('❌ Startup Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

startServer();
