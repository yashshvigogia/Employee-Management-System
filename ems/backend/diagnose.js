console.log('🔍 Diagnosing backend issues...\n');

// Check environment variables
console.log('1. Environment Variables:');
require('dotenv').config();
console.log('   PORT:', process.env.PORT || 'Not set (will use 5000)');
console.log('   DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('   DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Check if required modules can be loaded
console.log('\n2. Module Loading:');
try {
  require('express');
  console.log('   ✅ Express loaded');
} catch (e) {
  console.log('   ❌ Express failed:', e.message);
}

try {
  require('cors');
  console.log('   ✅ CORS loaded');
} catch (e) {
  console.log('   ❌ CORS failed:', e.message);
}

try {
  const { sequelize } = require('./src/models');
  console.log('   ✅ Models loaded');
  
  // Test database connection
  console.log('\n3. Database Connection:');
  sequelize.authenticate()
    .then(() => {
      console.log('   ✅ Database connected successfully');
      
      // Test if admin user exists
      const { User } = require('./src/models');
      return User.findOne({ where: { username: 'admin' } });
    })
    .then(adminUser => {
      if (adminUser) {
        console.log('   ✅ Admin user exists');
        console.log('   Username:', adminUser.username);
        console.log('   Email:', adminUser.email);
        console.log('   Active:', adminUser.isActive);
      } else {
        console.log('   ❌ Admin user not found');
      }
    })
    .catch(error => {
      console.log('   ❌ Database error:', error.message);
    });
    
} catch (e) {
  console.log('   ❌ Models failed:', e.message);
}

// Check if port is available
console.log('\n4. Port Check:');
const net = require('net');
const server = net.createServer();

server.listen(5000, () => {
  console.log('   ✅ Port 5000 is available');
  server.close();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('   ⚠️  Port 5000 is already in use');
  } else {
    console.log('   ❌ Port error:', err.message);
  }
});

console.log('\n5. Starting minimal test server...');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is working' });
});

const testServer = app.listen(5001, () => {
  console.log('   ✅ Test server started on port 5001');
  
  // Test the server
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/test',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('   ✅ Test server response:', data);
      testServer.close();
      console.log('\n🎯 Diagnosis complete!');
    });
  });

  req.on('error', (err) => {
    console.log('   ❌ Test server request failed:', err.message);
    testServer.close();
  });

  req.end();
});
