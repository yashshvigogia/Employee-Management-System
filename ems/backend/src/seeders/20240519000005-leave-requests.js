'use strict';
const { generateLeaveRequest } = require('../utils/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get employee IDs from the database if not available in global
    if (!global.employeeIds) {
      const employees = await queryInterface.sequelize.query(
        'SELECT id FROM "Employees"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      global.employeeIds = employees.map(emp => emp.id);
    }

    // Get user IDs from the database if not available in global
    if (!global.userIds) {
      const users = await queryInterface.sequelize.query(
        'SELECT id, username FROM "Users"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      global.userIds = users.reduce((acc, user) => {
        acc[user.username] = user.id;
        return acc;
      }, {});
    }

    const leaveRequests = [];

    // Create leave requests for each employee
    for (const employeeId of global.employeeIds) {
      // Create 1-3 leave requests per employee
      const numRequests = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numRequests; i++) {
        // Some leave requests will be approved by HR or manager
        const approvedById = Math.random() > 0.3 
          ? (Math.random() > 0.5 ? global.userIds.hr : global.userIds.manager) 
          : null;
        
        leaveRequests.push(generateLeaveRequest(employeeId, approvedById));
      }
    }

    await queryInterface.bulkInsert('LeaveRequests', leaveRequests, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('LeaveRequests', null, {});
  },
};
