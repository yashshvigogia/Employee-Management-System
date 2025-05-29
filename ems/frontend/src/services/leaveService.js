import api from './api';

const getAllLeaveRequests = () => {
  return api.get('/leaves');
};

const getLeaveRequestById = (id) => {
  return api.get(`/leaves/${id}`);
};

const getLeaveRequestsByEmployeeId = (employeeId) => {
  return api.get(`/leaves/employee/${employeeId}`);
};

const createLeaveRequest = (leaveData) => {
  return api.post('/leaves', leaveData);
};

const updateLeaveRequest = (id, leaveData) => {
  return api.put(`/leaves/${id}`, leaveData);
};

const approveLeaveRequest = (id, status, comments) => {
  return api.patch(`/leaves/${id}/approve`, { status, comments });
};

const deleteLeaveRequest = (id) => {
  return api.delete(`/leaves/${id}`);
};

const leaveService = {
  getAllLeaveRequests,
  getLeaveRequestById,
  getLeaveRequestsByEmployeeId,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  deleteLeaveRequest,
};

export default leaveService;
