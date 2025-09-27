import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Configure axios to include credentials (session cookies)
axios.defaults.withCredentials = true;

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear any stored auth data (for complete logout)
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.clear();
};