'use strict';

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    managerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
  });

  Department.associate = (models) => {
    Department.hasMany(models.Employee, { foreignKey: 'departmentId', as: 'employees' });
    Department.belongsTo(models.Employee, { foreignKey: 'managerId', as: 'manager' });
  };

  return Department;
};
