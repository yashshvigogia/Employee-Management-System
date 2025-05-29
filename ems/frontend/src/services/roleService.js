import api from './api';

const getAllRoles = () => {
  return api.get('/roles');
};

const getRoleById = (id) => {
  return api.get(`/roles/${id}`);
};

const createRole = (roleData) => {
  return api.post('/roles', roleData);
};

const updateRole = (id, roleData) => {
  return api.put(`/roles/${id}`, roleData);
};

const deleteRole = (id) => {
  return api.delete(`/roles/${id}`);
};

const roleService = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

export default roleService;
