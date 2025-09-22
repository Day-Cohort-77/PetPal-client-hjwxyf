import { get, post, put, del } from './apiService';

// Get all pets (admin only)
export const getAllPets = async () => {
  return get('/pets');
};

// Get pets for the current user
export const getUserPets = async () => {
  return get('/user/pets');
};

// Get a specific pet by ID
export const getPetById = async (petId) => {
  return get(`/pets/${petId}`);
};

// Create a new pet
export const createPet = async (petData) => {
  return post('/pets', petData);
};

// Update a pet
export const updatePet = async (petId, petData) => {
  return put(`/pets/${petId}`, petData);
};

// Delete a pet
export const deletePet = async (petId) => {
  return del(`/pets/${petId}`);
};

// Add an owner to a pet
export const addPetOwner = async (petId, ownerData) => {
  return post(`/pets/${petId}/owners`, ownerData);
};

// Remove an owner from a pet
export const removePetOwner = async (petId, ownerId) => {
  return del(`/pets/${petId}/owners/${ownerId}`);
};

export default {
  getAllPets,
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  addPetOwner,
  removePetOwner,
};