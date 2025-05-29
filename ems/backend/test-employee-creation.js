const axios = require('axios');

async function testEmployeeCreation() {
  try {
    console.log('Testing employee creation with email simulation...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful');

    // Step 2: Get roles to find Employee role ID
    console.log('2. Fetching roles...');
    const rolesResponse = await axios.get('http://localhost:5000/api/roles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const employeeRole = rolesResponse.data.roles.find(role => role.name === 'Employee');
    if (!employeeRole) {
      console.log('❌ Employee role not found');
      return;
    }
    console.log('✓ Employee role found:', employeeRole.name);

    // Step 3: Create a new employee
    console.log('3. Creating new employee...');
    const employeeData = {
      firstName: 'Test',
      lastName: 'Employee',
      email: 'test.employee@example.com',
      phone: '123-456-7890',
      position: 'Software Developer',
      hireDate: '2024-01-15',
      salary: 50000,
      roleId: employeeRole.id
    };

    const createResponse = await axios.post('http://localhost:5000/api/employees', employeeData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Employee created successfully!');
    console.log('Employee ID:', createResponse.data.employee.employeeId);
    console.log('\n📧 Check the backend console for the email simulation output!');
    console.log('You should see something like:');
    console.log('=== EMAIL SIMULATION ===');
    console.log('To: test.employee@example.com');
    console.log('Subject: Welcome to Employee Management System - Set Your Password');
    console.log('Employee: Test Employee');
    console.log('Password Setup URL: http://localhost:5173/setup-password?token=...');
    console.log('========================');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testEmployeeCreation();
