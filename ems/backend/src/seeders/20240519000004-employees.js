'use strict';
const { generateEmployee } = require('../utils/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

    // Get department IDs from the database if not available in global
    if (!global.departmentIds) {
      const departments = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Departments"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      global.departmentIds = departments.reduce((acc, dept) => {
        acc[dept.name] = dept.id;
        return acc;
      }, {});
    }

    // Create employees for predefined users
    const adminEmployee = generateEmployee(
      global.userIds.admin,
      global.departmentIds['Operations']
    );

    const hrEmployee = generateEmployee(
      global.userIds.hr,
      global.departmentIds['Human Resources']
    );

    const managerEmployee = generateEmployee(
      global.userIds.manager,
      global.departmentIds['Engineering']
    );

    const employeeEmployee = generateEmployee(
      global.userIds.employee,
      global.departmentIds['Engineering'],
      managerEmployee.id // Set manager
    );

    const employees = [adminEmployee, hrEmployee, managerEmployee, employeeEmployee];

    // Create additional employees
    const departmentNames = Object.keys(global.departmentIds);
    const usernames = Object.keys(global.userIds).filter(username => 
      !['admin', 'hr', 'manager', 'employee'].includes(username)
    );

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      const departmentName = departmentNames[i % departmentNames.length];
      const managerId = i % 3 === 0 ? managerEmployee.id : null;
      
      employees.push(generateEmployee(
        global.userIds[username],
        global.departmentIds[departmentName],
        managerId
      ));
    }

    await queryInterface.bulkInsert('Employees', employees, {});

    // Store employee IDs for reference in other seeders
    global.employeeIds = employees.map(emp => emp.id);
    
    // Update departments with managers
    await queryInterface.bulkUpdate(
      'Departments',
      { managerId: hrEmployee.id },
      { name: 'Human Resources' }
    );
    
    await queryInterface.bulkUpdate(
      'Departments',
      { managerId: managerEmployee.id },
      { name: 'Engineering' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Employees', null, {});
  },
};
