const { User, Role, Employee, Department } = require('./src/models');

async function createEmployeeUser() {
  try {
    console.log('Creating employee user for testing...');

    // Get or create Employee role
    let employeeRole = await Role.findOne({ where: { name: 'Employee' } });
    if (!employeeRole) {
      employeeRole = await Role.create({
        name: 'Employee',
        description: 'Regular Employee',
        permissions: {
          employees: ['read'],
          departments: ['read'],
          roles: [],
          attendance: ['create', 'read'],
          leaves: ['create', 'read']
        }
      });
      console.log('✅ Created Employee role');
    }

    // Get or create a department
    let department = await Department.findOne();
    if (!department) {
      department = await Department.create({
        name: 'IT Department',
        description: 'Information Technology Department'
      });
      console.log('✅ Created IT Department');
    }

    // Create employee record
    const employee = await Employee.create({
      employeeId: 'EMP002', // Employee number/ID string
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1234567890',
      position: 'Software Developer',
      departmentId: department.id,
      hireDate: new Date(),
      salary: 75000,
      isActive: true
    });
    console.log('✅ Created employee record');

    // Create user account for the employee
    const user = await User.create({
      username: 'john.doe',
      email: 'john.doe@company.com',
      password: 'password123', // Will be hashed by model hooks
      roleId: employeeRole.id,
      employeeId: employee.id,
      isActive: true,
      isPasswordSet: true
    });

    // Update employee with user ID
    await employee.update({
      userId: user.id
    });

    console.log('✅ Employee user created successfully!');
    console.log('Username: john.doe');
    console.log('Password: password123');
    console.log('Employee ID:', employee.id);
    console.log('User ID:', user.id);

    // Test the password
    const isValid = await user.isValidPassword('password123');
    console.log('Password test:', isValid ? 'PASS' : 'FAIL');

  } catch (error) {
    console.error('Error creating employee user:', error.message);
  }
}

createEmployeeUser();
