import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';
import { useSnackbar } from './SnackbarContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if token is expired
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token is expired
          logout();
        } else {
          // Get user profile
          authService.getProfile()
            .then(response => {
              setUser(response.data.user);
            })
            .catch(error => {
              console.error('Error fetching user profile:', error);
              logout();
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set user in state
      setUser(user);

      // Show success message
      showSnackbar('Login successful', 'success');

      // Redirect to dashboard
      navigate('/dashboard');

      return true;
    } catch (error) {
      console.error('Login error:', error);

      // Show error message
      const errorMessage = error.response?.data?.message || 'Login failed';
      showSnackbar(errorMessage, 'error');

      return false;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Clear user from state
    setUser(null);

    // Redirect to login page
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasPermission = (resource, action) => {
    if (!user || !user.permissions) return false;
    return user.permissions[resource]?.includes(action) || false;
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        hasPermission,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
