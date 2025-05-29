const http = require('http');

// Step 1: Login as admin
function loginAsAdmin() {
  return new Promise((resolve, reject) => {
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
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Admin login successful');
          resolve(response.token);
        } else {
          console.log('❌ Admin login failed:', data);
          reject(new Error('Login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Get Employee role ID
function getEmployeeRoleId(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/roles',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const employeeRole = response.roles.find(role => role.name === 'Employee');
          if (employeeRole) {
            console.log('✅ Employee role found:', employeeRole.id);
            resolve(employeeRole.id);
          } else {
            reject(new Error('Employee role not found'));
          }
        } else {
          reject(new Error('Failed to get roles'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 3: Create new employee
function createEmployee(token, roleId) {
  return new Promise((resolve, reject) => {
    const employeeData = {
      firstName: 'Test',
      lastName: 'Employee',
      email: 'test.employee@example.com',
      phone: '123-456-7890',
      position: 'Software Developer',
      hireDate: '2024-01-15',
      salary: 50000,
      roleId: roleId
    };

    const postData = JSON.stringify(employeeData);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/employees',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          console.log('✅ Employee created successfully!');
          console.log('Credentials:', response.credentials);
          resolve(response.credentials);
        } else {
          console.log('❌ Employee creation failed:', data);
          reject(new Error('Employee creation failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 4: Test login with new employee credentials
function testEmployeeLogin(credentials) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: credentials.username,
      password: credentials.password
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
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Employee login successful!');
          console.log('Employee user:', response.user);
          resolve(response);
        } else {
          console.log('❌ Employee login failed:', data);
          reject(new Error('Employee login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    console.log('🧪 Testing new employee creation and login...\n');
    
    const adminToken = await loginAsAdmin();
    const roleId = await getEmployeeRoleId(adminToken);
    const credentials = await createEmployee(adminToken, roleId);
    await testEmployeeLogin(credentials);
    
    console.log('\n🎉 All tests passed! New employee can login successfully.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTest();
