import axiosInstance from '../utils/axiosConfig';

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await axiosInstance.put(`/users/${userData.id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};