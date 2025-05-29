'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
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
    password: {
      type: DataTypes.STRING,
      allowNull: true, 
      validate: {
        passwordRequired(value) {
          if (this.isPasswordSet && (!value || value.trim() === '')) {
            throw new Error('Password is required when isPasswordSet is true');
          }
          if (value && value.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          if (value && value.length > 100) {
            throw new Error('Password must be less than 100 characters');
          }
        },
      },
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    passwordSetupToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordSetupTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPasswordSet: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    hooks: {
      beforeCreate: async (user) => {
        // Only hash password if it exists and is not null/empty
        if (user.password && typeof user.password === 'string' && user.password.trim() !== '') {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Only hash password if it changed and is not null/empty
        if (user.changed('password') && user.password && typeof user.password === 'string' && user.password.trim() !== '') {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    User.hasOne(models.Employee, { foreignKey: 'userId', as: 'employee' });
  };

  // Instance method to check if password is valid
  User.prototype.isValidPassword = async function (password) {
    // If user hasn't set a password yet, return false
    if (!this.password || !this.isPasswordSet) {
      return false;
    }
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
