const { User, Employee, Role, Department } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Get current user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        {
          model: Employee,
          as: 'employee',
          include: [
            { model: Department, as: 'department' }
          ]
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.name,
          permissions: user.role.permissions,
          employee: user.employee,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Error getting user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      gender,
      username,
    } = req.body;

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Employee, as: 'employee' }],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Update user data
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        where: { username },
        attributes: ['id'],
      });

      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          message: 'Username already exists',
        });
      }

      await user.update({ username });
    }

    // Update employee data if exists
    if (user.employee) {
      const updateData = {};

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (gender) updateData.gender = gender;

      await user.employee.update(updateData);
    }

    // Fetch updated user data
    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'role' },
        {
          model: Employee,
          as: 'employee',
          include: [
            { model: Department, as: 'department' }
          ]
        },
      ],
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role.name,
          permissions: updatedUser.role.permissions,
          employee: updatedUser.employee,
          lastLogin: updatedUser.lastLogin,
          isActive: updatedUser.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Verify current password
    const isValidPassword = await user.isValidPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Employee, as: 'employee' }],
    });

    if (!user || !user.employee) {
      return res.status(404).json({
        message: 'Employee profile not found',
      });
    }

    // Delete old profile picture if exists
    if (user.employee.profilePicture) {
      const oldFilePath = path.join(__dirname, '../../uploads', user.employee.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update employee with new profile picture path
    const profilePicturePath = req.file.filename;
    await user.employee.update({ profilePicture: profilePicturePath });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePicturePath,
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture
};
