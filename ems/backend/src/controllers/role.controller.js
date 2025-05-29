const { Role, User } = require('../models');

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id'],
        },
      ],
    });

    // Add user count to each role
    const rolesWithCount = roles.map(role => ({
      ...role.toJSON(),
      userCount: role.users ? role.users.length : 0,
    }));

    res.status(200).json({
      message: 'Roles retrieved successfully',
      roles: rolesWithCount
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      message: 'Error getting roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        { model: User, as: 'users', attributes: { exclude: ['password'] } },
      ],
    });

    if (!role) {
      return res.status(404).json({
        message: 'Role not found',
      });
    }

    res.status(200).json({ role });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      message: 'Error getting role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new role
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await Role.create({
      name,
      description,
      permissions,
    });

    res.status(201).json({
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      message: 'Error creating role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        message: 'Role not found',
      });
    }

    await role.update({
      name,
      description,
      permissions,
    });

    res.status(200).json({
      message: 'Role updated successfully',
      role,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      message: 'Error updating role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        message: 'Role not found',
      });
    }

    // Check if role is being used by any users
    const userCount = await User.count({ where: { roleId: id } });
    if (userCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete role: it is assigned to users',
      });
    }

    await role.destroy();

    res.status(200).json({
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      message: 'Error deleting role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
