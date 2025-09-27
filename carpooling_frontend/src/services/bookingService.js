import axiosInstance from '../utils/axiosConfig';

export const getBookingsByRider = async (riderId) => {
  try {
    const response = await axiosInstance.get(`/bookings/rider/${riderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookingsByRide = async (rideId) => {
  try {
    const response = await axiosInstance.get(`/bookings/ride/${rideId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (riderId, rideId, bookingData) => {
  try {
    const response = await axiosInstance.post(
      `/bookings/rider/${riderId}/ride/${rideId}`,
      bookingData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};