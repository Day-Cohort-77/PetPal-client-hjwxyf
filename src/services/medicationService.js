import { get, post, put, del } from "./apiService";

// Get all health records for a pet
export const getMedications = async (petId) => {
  return get(`/pets/${petId}/medications`);
};

// Get a specific health record by ID
export const getMedicationsById = async (recordId) => {
  return get(`/medications/${recordId}`);
};

// Create a new health record
export const createMedication = async (recordData) => {
  return post("/medications", recordData);
};

// Update a health record
export const updateMedication = async (recordId, recordData) => {
  return put(`/medications/${recordId}`, recordData);
};

// Delete a health record
export const deleteMedication = async (recordId) => {
  return del(`/medications/${recordId}`);
};

export default {
  getMedications,
  getMedicationsById,
  createMedication,
  updateMedication,
  deleteMedication,
};
