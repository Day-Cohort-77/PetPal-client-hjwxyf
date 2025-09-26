import { put, del } from './apiService';

// Update a user profile
export const updateUser = async (userId, userData) => {
  return put(`/users/${userId}`, userData);
};

// Delete a user
export const deleteUser = async (userId) => {
  return del(`/users/${userId}`);
};

export default {
  updateUser,
  deleteUser
};
