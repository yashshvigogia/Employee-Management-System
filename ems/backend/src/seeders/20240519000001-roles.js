'use strict';
const { generateRole } = require('../utils/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPermissions = JSON.stringify({
      users: ['create', 'read', 'update', 'delete'],
      employees: ['create', 'read', 'update', 'delete'],
      departments: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
      leaves: ['create', 'read', 'update', 'delete', 'approve'],
      attendance: ['create', 'read', 'update', 'delete'],
    });

    const hrPermissions = JSON.stringify({
      users: ['read'],
      employees: ['create', 'read', 'update'],
      departments: ['read'],
      roles: ['read'],
      leaves: ['read', 'update', 'approve'],
      attendance: ['create', 'read', 'update'],
    });

    const managerPermissions = JSON.stringify({
      users: ['read'],
      employees: ['read'],
      departments: ['read'],
      roles: ['read'],
      leaves: ['read', 'approve'],
      attendance: ['read'],
    });

    const employeePermissions = JSON.stringify({
      users: ['read'],
      employees: ['read'],
      departments: ['read'],
      roles: ['read'],
      leaves: ['create', 'read'],
      attendance: ['create', 'read'],
    });

    const roles = [
      generateRole('Admin', 'Administrator with full access to all features', adminPermissions),
      generateRole('HR', 'Human Resources with access to employee management', hrPermissions),
      generateRole('Manager', 'Department manager with access to team management', managerPermissions),
      generateRole('Employee', 'Regular employee with limited access', employeePermissions),
    ];

    await queryInterface.bulkInsert('Roles', roles, {});

    // Store role IDs for reference in other seeders
    global.roleIds = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  },
};
