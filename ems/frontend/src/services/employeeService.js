import api from './api';

const getAllEmployees = () => {
  return api.get('/employees');
};

const getEmployeeById = (id) => {
  return api.get(`/employees/${id}`);
};

const createEmployee = (employeeData) => {
  return api.post('/employees', employeeData);
};

const updateEmployee = (id, employeeData) => {
  return api.put(`/employees/${id}`, employeeData);
};

const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};

const employeeService = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

export default employeeService;
