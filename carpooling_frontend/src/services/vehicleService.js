import axiosInstance from '../utils/axiosConfig';

export const getUserVehicles = async (userId) => {
  try {
    const response = await axiosInstance.get(`/vehicles/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createVehicle = async (userId, vehicleData) => {
  try {
    const response = await axiosInstance.post(`/vehicles/user/${userId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const response = await axiosInstance.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    await axiosInstance.delete(`/vehicles/${vehicleId}`);
    return true;
  } catch (error) {
    throw error;
  }
};