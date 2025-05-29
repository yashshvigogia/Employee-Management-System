import api from './api';

const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

const register = (userData) => {
  return api.post('/auth/register', userData);
};

const getProfile = () => {
  return api.get('/auth/profile');
};

const logout = () => {
  return api.post('/auth/logout');
};

const verifyPasswordSetupToken = (token) => {
  return api.get(`/password-setup/verify/${token}`);
};

const setupPassword = (data) => {
  return api.post('/password-setup/setup', data);
};

const authService = {
  login,
  register,
  getProfile,
  logout,
  verifyPasswordSetupToken,
  setupPassword,
};

export default authService;
