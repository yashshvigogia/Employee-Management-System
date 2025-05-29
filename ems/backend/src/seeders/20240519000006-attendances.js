'use strict';
const { generateAttendance } = require('../utils/faker');

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

    const attendances = [];

    // Create attendance records for each employee
    for (const employeeId of global.employeeIds) {
      // Create attendance records for the past 30 days
      for (let i = 0; i < 30; i++) {
        // Skip weekends (approximately)
        if (i % 7 === 0 || i % 7 === 6) continue;
        
        // 80% chance of having an attendance record for a workday
        if (Math.random() < 0.8) {
          attendances.push(generateAttendance(employeeId));
        }
      }
    }

    await queryInterface.bulkInsert('Attendances', attendances, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Attendances', null, {});
  },
};
