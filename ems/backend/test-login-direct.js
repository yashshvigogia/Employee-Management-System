const http = require('http');

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

  console.log('🧪 Testing login endpoint...');
  console.log('📤 Sending request to:', `http://localhost:5000${options.path}`);
  console.log('📄 Request body:', postData);

  const req = http.request(options, (res) => {
    console.log('📥 Response status:', res.statusCode);
    console.log('📋 Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response body:', data);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Login successful!');
          console.log('🎫 Token:', parsed.token?.substring(0, 20) + '...');
          console.log('👤 User:', parsed.user?.username);
          console.log('🎭 Role:', parsed.user?.role);
        } catch (e) {
          console.log('⚠️ Could not parse response as JSON');
        }
      } else {
        console.log('❌ Login failed');
        try {
          const parsed = JSON.parse(data);
          console.log('💬 Error message:', parsed.message);
        } catch (e) {
          console.log('⚠️ Could not parse error response');
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('🚨 Request error:', e.message);
    console.log('💡 Make sure the backend server is running on port 5000');
  });

  req.write(postData);
  req.end();
}

// Test multiple times to be sure
console.log('🔄 Running login test...\n');
testLogin();

setTimeout(() => {
  console.log('\n🔄 Running second test...\n');
  testLogin();
}, 2000);
