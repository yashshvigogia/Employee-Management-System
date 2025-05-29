import api from './api';

const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get profile picture URL
  getProfilePictureUrl: (filename) => {
    if (!filename) return null;
    // Use the static file route (remove /api from base URL)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix
    return `${baseUrl}/uploads/${filename}`;
  },

  // Alternative profile picture URL (API route)
  getProfilePictureUrlAPI: (filename) => {
    if (!filename) return null;
    return `${import.meta.env.VITE_API_URL}/profile/picture/${filename}`;
  },
};

export default profileService;
