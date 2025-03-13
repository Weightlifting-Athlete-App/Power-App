import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getUserData = async (username: string) => {
  try {
    const response = await axios.get(`${API_URL}/User_Data/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
