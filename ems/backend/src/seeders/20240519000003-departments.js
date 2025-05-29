'use strict';
const { generateDepartment } = require('../utils/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const departments = [
      generateDepartment('Human Resources', 'Responsible for recruiting, hiring, and training employees'),
      generateDepartment('Engineering', 'Responsible for designing, developing, and maintaining software products'),
      generateDepartment('Marketing', 'Responsible for promoting and selling products or services'),
      generateDepartment('Finance', 'Responsible for financial planning, management, and reporting'),
      generateDepartment('Operations', 'Responsible for day-to-day business operations'),
      generateDepartment('Customer Support', 'Responsible for providing assistance to customers'),
    ];

    await queryInterface.bulkInsert('Departments', departments, {});

    // Store department IDs for reference in other seeders
    global.departmentIds = departments.reduce((acc, dept) => {
      acc[dept.name] = dept.id;
      return acc;
    }, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Departments', null, {});
  },
};
