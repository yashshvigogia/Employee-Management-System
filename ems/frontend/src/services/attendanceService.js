import api from './api';

const getAllAttendances = () => {
  return api.get('/attendance');
};

const getAttendanceById = (id) => {
  return api.get(`/attendance/${id}`);
};

const getAttendancesByEmployeeId = (employeeId, startDate, endDate) => {
  let url = `/attendance/employee/${employeeId}`;
  
  // Add query parameters if provided
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return api.get(url);
};

const getAttendanceStats = (startDate, endDate, departmentId) => {
  let url = '/attendance/stats';
  
  // Add query parameters if provided
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (departmentId) params.append('departmentId', departmentId);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return api.get(url);
};

const createAttendance = (attendanceData) => {
  return api.post('/attendance', attendanceData);
};

const updateAttendance = (id, attendanceData) => {
  return api.put(`/attendance/${id}`, attendanceData);
};

const deleteAttendance = (id) => {
  return api.delete(`/attendance/${id}`);
};

const attendanceService = {
  getAllAttendances,
  getAttendanceById,
  getAttendancesByEmployeeId,
  getAttendanceStats,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};

export default attendanceService;
