'use strict';

module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define('LeaveRequest', {
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
    leaveType: {
      type: DataTypes.ENUM('Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending',
    },
    approvedById: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    comments: {
      type: DataTypes.TEXT,
    },
  });

  LeaveRequest.associate = (models) => {
    LeaveRequest.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
    LeaveRequest.belongsTo(models.User, { foreignKey: 'approvedById', as: 'approvedBy' });
  };

  return LeaveRequest;
};
