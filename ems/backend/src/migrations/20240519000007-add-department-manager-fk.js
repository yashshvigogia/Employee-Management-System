'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Departments', {
      fields: ['managerId'],
      type: 'foreign key',
      name: 'departments_manager_fk',
      references: {
        table: 'Employees',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Departments', 'departments_manager_fk');
  },
};
