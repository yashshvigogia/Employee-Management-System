const { Department, Employee } = require('../models');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: Employee, as: 'manager' },
      ],
    });

    res.status(200).json({ departments });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({
      message: 'Error getting departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        { model: Employee, as: 'manager' },
        { model: Employee, as: 'employees' },
      ],
    });

    if (!department) {
      return res.status(404).json({
        message: 'Department not found',
      });
    }

    res.status(200).json({ department });
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({
      message: 'Error getting department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    const department = await Department.create({
      name,
      description,
      managerId,
    });

    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      message: 'Error creating department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        message: 'Department not found',
      });
    }

    await department.update({
      name,
      description,
      managerId,
    });

    res.status(200).json({
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      message: 'Error updating department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        message: 'Department not found',
      });
    }

    await department.destroy();

    res.status(200).json({
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      message: 'Error deleting department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
