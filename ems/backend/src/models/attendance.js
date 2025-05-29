'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
    },
    checkOut: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Half-day', 'On Leave'),
      defaultValue: 'Present',
    },
    workHours: {
      type: DataTypes.DECIMAL(5, 2),
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
  };

  return Attendance;
};
