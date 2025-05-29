import api from './api';

const getAllDepartments = () => {
  return api.get('/departments');
};

const getDepartmentById = (id) => {
  return api.get(`/departments/${id}`);
};

const createDepartment = (departmentData) => {
  return api.post('/departments', departmentData);
};

const updateDepartment = (id, departmentData) => {
  return api.put(`/departments/${id}`, departmentData);
};

const deleteDepartment = (id) => {
  return api.delete(`/departments/${id}`);
};

const departmentService = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

export default departmentService;
