const http = require('http');

function testServer() {
  console.log('Testing if server is running...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response:', data);
      
      // Now test login endpoint
      testLogin();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Server is not running:', e.message);
  });

  req.end();
}

function testLogin() {
  console.log('\nTesting login endpoint...');
  
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

  const req = http.request(options, (res) => {
    console.log(`Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Login successful!');
        const response = JSON.parse(data);
        console.log('User:', response.user.username);
        console.log('Role:', response.user.role);
      } else {
        console.log('❌ Login failed');
        console.log('Response:', data);
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
