import { get, post } from './apiService';

// Register a new user
export const register = async (userData) => {
  return post('/auth/register', userData);
};

// Login a user
export const login = async (credentials) => {
  return post('/auth/login', credentials);
};

// Logout the current user
export const logout = async () => {
  return post('/auth/logout');
};

// Get the current user's profile
export const getCurrentUser = async () => {
  try {
    return await get('/auth/me');
  } catch (error) {
    // If there's an error (like 401 Unauthorized), return null
    console.error('Error getting current user:', error);
    return null;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};