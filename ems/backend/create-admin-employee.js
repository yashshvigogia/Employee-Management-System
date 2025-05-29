const { User, Employee, Department } = require('./src/models');

async function createAdminEmployee() {
  try {
    console.log('Creating employee record for admin user...');

    // Find the admin user
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Check if admin already has an employee record
    if (adminUser.employeeId) {
      console.log('✅ Admin already has an employee record');
      return;
    }

    // Get or create a department
    let department = await Department.findOne();
    if (!department) {
      department = await Department.create({
        name: 'Administration',
        description: 'Administrative Department'
      });
      console.log('✅ Created Administration Department');
    }

    // Create employee record for admin
    const adminEmployee = await Employee.create({
      employeeId: 'EMP001', // Employee number/ID string
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@example.com',
      phone: '+1234567890',
      position: 'System Administrator',
      departmentId: department.id,
      hireDate: new Date(),
      salary: 100000,
      userId: adminUser.id,
      isActive: true
    });

    // Update admin user with employee ID
    await adminUser.update({
      employeeId: adminEmployee.id
    });

    console.log('✅ Admin employee record created successfully!');
    console.log('Employee ID:', adminEmployee.id);
    console.log('Admin user updated with employeeId');

  } catch (error) {
    console.error('Error creating admin employee:', error.message);
  }
}

createAdminEmployee();
