import axiosInstance from '../utils/axiosConfig';

export const processPayment = async (bookingId, paymentDetails) => {
  try {
    const response = await axiosInstance.post(`/payments/booking/${bookingId}`, paymentDetails);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentByBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refundPayment = async (paymentId) => {
  try {
    const response = await axiosInstance.post(`/payments/${paymentId}/refund`);
    return response.data;
  } catch (error) {
    throw error;
  }
};