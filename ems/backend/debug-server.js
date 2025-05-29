console.log('🔍 Debug: Starting server...');

try {
  console.log('1. Loading environment variables...');
  require('dotenv').config();
  console.log('✅ Environment loaded');

  console.log('2. Loading Express...');
  const express = require('express');
  console.log('✅ Express loaded');

  console.log('3. Loading models...');
  const { sequelize } = require('./src/models');
  console.log('✅ Models loaded');

  console.log('4. Testing database connection...');
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected');
      
      console.log('5. Loading server...');
      const app = require('./src/server');
      console.log('✅ Server loaded successfully!');
      
    })
    .catch(error => {
      console.error('❌ Database connection failed:', error.message);
    });

} catch (error) {
  console.error('❌ Error during startup:', error.message);
  console.error('Stack trace:', error.stack);
}
