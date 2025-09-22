import { get, post, put, del } from './apiService';

// Get all health records for a pet
export const getPetHealthRecords = async (petId) => {
  return get(`/pets/${petId}/health-records`);
};

// Get a specific health record by ID
export const getHealthRecordById = async (recordId) => {
  return get(`/health-records/${recordId}`);
};

// Create a new health record
export const createHealthRecord = async (recordData) => {
  return post('/health-records', recordData);
};

// Update a health record
export const updateHealthRecord = async (recordId, recordData) => {
  return put(`/health-records/${recordId}`, recordData);
};

// Delete a health record
export const deleteHealthRecord = async (recordId) => {
  return del(`/health-records/${recordId}`);
};

export default {
  getPetHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
};