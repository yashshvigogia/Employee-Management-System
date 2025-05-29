const http = require('http');

// Test roles API
async function testRolesAPI() {
  console.log('🧪 Testing Roles API...\n');

  // Step 1: Login as admin
  const token = await loginAsAdmin();
  if (!token) return;

  // Step 2: Test GET /api/roles
  await testGetRoles(token);

  // Step 3: Test POST /api/roles (create role)
  await testCreateRole(token);

  console.log('\n🎉 Roles API test complete!');
}

function loginAsAdmin() {
  return new Promise((resolve) => {
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
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Admin login successful');
          resolve(response.token);
        } else {
          console.log('❌ Admin login failed');
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Login request failed:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

function testGetRoles(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/roles',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('📋 Testing GET /api/roles...');

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ GET roles successful');
          console.log(`   Found ${response.roles.length} roles`);
          response.roles.forEach(role => {
            console.log(`   - ${role.name}: ${role.userCount || 0} users`);
          });
        } else {
          console.log('❌ GET roles failed:', res.statusCode);
          console.log('   Response:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ GET roles request failed:', e.message);
      resolve();
    });

    req.end();
  });
}

function testCreateRole(token) {
  return new Promise((resolve) => {
    const roleData = {
      name: 'Test Role',
      description: 'A test role created by API',
      permissions: {
        employees: ['read'],
        departments: ['read'],
        roles: [],
        attendance: ['read'],
        leaves: ['read']
      }
    };

    const postData = JSON.stringify(roleData);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/roles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('\n🆕 Testing POST /api/roles (create role)...');

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          console.log('✅ Create role successful');
          console.log(`   Created role: ${response.role.name}`);
        } else {
          console.log('❌ Create role failed:', res.statusCode);
          console.log('   Response:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Create role request failed:', e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

testRolesAPI();
