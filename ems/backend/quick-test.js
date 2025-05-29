const http = require('http');

// Test if server is running
function testServer() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  console.log('Testing server...');
  
  const req = http.request(options, (res) => {
    console.log('✅ Server is running on port 5000');
    console.log('Status:', res.statusCode);
    
    // Test login
    testLogin();
  });

  req.on('error', (e) => {
    console.error('❌ Server is not running:', e.message);
    console.log('Please start the backend server with: node src/server.js');
  });

  req.end();
}

// Test admin login
function testLogin() {
  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\nTesting admin login...');
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Login response status:', res.statusCode);
      console.log('Login response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Admin login works!');
      } else {
        console.log('❌ Admin login failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login request failed:', e.message);
  });

  req.write(postData);
  req.end();
}

testServer();
