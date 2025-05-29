'use strict';

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9+\-\s()]*$/i,
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
    },
    position: {
      type: DataTypes.STRING,
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
    },
    departmentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Departments',
        key: 'id',
      },
    },
    managerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    Employee.belongsTo(models.Employee, { foreignKey: 'managerId', as: 'manager' });
    Employee.hasMany(models.Employee, { foreignKey: 'managerId', as: 'subordinates' });
    Employee.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Employee.hasMany(models.LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
    Employee.hasMany(models.Attendance, { foreignKey: 'employeeId', as: 'attendances' });
  };

  return Employee;
};
