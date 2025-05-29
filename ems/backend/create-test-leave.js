const { LeaveRequest, Employee } = require('./src/models');

async function createTestLeave() {
  try {
    console.log('Creating test leave request...');

    // Find an employee
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('❌ No employee found');
      return;
    }

    // Create a test leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId: employee.id,
      leaveType: 'Annual',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      reason: 'Family vacation - need some time off to spend with family',
      status: 'Pending'
    });

    console.log('✅ Test leave request created successfully!');
    console.log('Leave ID:', leaveRequest.id);
    console.log('Employee:', employee.firstName, employee.lastName);
    console.log('Status:', leaveRequest.status);
    console.log('Type:', leaveRequest.leaveType);

  } catch (error) {
    console.error('Error creating test leave:', error.message);
  }
}

createTestLeave();
