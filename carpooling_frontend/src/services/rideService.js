import axiosInstance from '../utils/axiosConfig';

export const searchRides = async (origin, destination, departureTime) => {
  try {
    // Simple logging to see what's being sent
    console.log('Searching with:', { origin, destination, departureTime });
    
    const response = await axiosInstance.get('/rides/search', {
      params: {
        origin: origin,
        destination: destination,
        departureTime: departureTime // Parameter name must match controller
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRidesByDriver = async (driverId) => {
  try {
    const response = await axiosInstance.get(`/rides/driver/${driverId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRide = async (driverId, vehicleId, rideData) => {
  try {
    const response = await axiosInstance.post(
      `/rides/driver/${driverId}/vehicle/${vehicleId}`,
      rideData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRideStatus = async (rideId, status) => {
  try {
    const response = await axiosInstance.put(`/rides/${rideId}/status`, null, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRideById = async (rideId) => {
  try {
    const response = await axiosInstance.get(`/rides/${rideId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};