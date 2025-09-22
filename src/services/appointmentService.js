import { get, post, put, del } from './apiService';

// Get all appointments (admin only)
export const getAllAppointments = async () => {
  return get('/appointments');
};

// Get appointments for the current user
export const getUserAppointments = async () => {
  return get('/user/appointments');
};

// Get appointments for a specific pet
export const getPetAppointments = async (petId) => {
  return get(`/pets/${petId}/appointments`);
};

// Get a specific appointment by ID
export const getAppointmentById = async (appointmentId) => {
  return get(`/appointments/${appointmentId}`);
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  return post('/appointments', appointmentData);
};

// Update an appointment
export const updateAppointment = async (appointmentId, appointmentData) => {
  return put(`/appointments/${appointmentId}`, appointmentData);
};

// Delete an appointment
export const deleteAppointment = async (appointmentId) => {
  return del(`/appointments/${appointmentId}`);
};

export default {
  getAllAppointments,
  getUserAppointments,
  getPetAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};