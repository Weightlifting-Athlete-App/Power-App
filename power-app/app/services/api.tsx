// services/api.ts
import axios from 'axios';

const API_URL = 'http://172.28.12.21:5000/api';

export const getUserData = async (username: string) => {
  try {
    // Use backticks to interpolate the username and include the '/api' prefix.
    const response = await axios.get(`${API_URL}/UserData/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const ApiService = {
  getUserData,
};

export default ApiService;
