'use strict';
const { generateUser, generateUUID } = require('../utils/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get role IDs from the database if not available in global
    if (!global.roleIds) {
      const roles = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Roles"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      global.roleIds = roles.reduce((acc, role) => {
        acc[role.name] = role.id;
        return acc;
      }, {});
    }

    // Create admin user
    const adminUser = await generateUser(
      global.roleIds.Admin,
      'admin',
      'admin@example.com',
      'admin123'
    );

    // Create HR user
    const hrUser = await generateUser(
      global.roleIds.HR,
      'hr',
      'hr@example.com',
      'hr123'
    );

    // Create manager user
    const managerUser = await generateUser(
      global.roleIds.Manager,
      'manager',
      'manager@example.com',
      'manager123'
    );

    // Create employee user
    const employeeUser = await generateUser(
      global.roleIds.Employee,
      'employee',
      'employee@example.com',
      'employee123'
    );

    const users = [adminUser, hrUser, managerUser, employeeUser];

    // Create additional employee users
    for (let i = 1; i <= 10; i++) {
      const username = `employee${i}`;
      const email = `employee${i}@example.com`;
      users.push(await generateUser(global.roleIds.Employee, username, email));
    }

    await queryInterface.bulkInsert('Users', users, {});

    // Store user IDs for reference in other seeders
    global.userIds = users.reduce((acc, user) => {
      acc[user.username] = user.id;
      return acc;
    }, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
