const http = require('http');

function testLoginAPI() {
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

  console.log('Testing login API...\n');
  console.log('Request:', options);
  console.log('Data:', postData);

  const req = http.request(options, (res) => {
    console.log('\nResponse Status:', res.statusCode);
    console.log('Response Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\nResponse Body:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('\nParsed Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse JSON response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

testLoginAPI();
