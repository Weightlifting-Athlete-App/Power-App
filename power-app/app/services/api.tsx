// services/api.ts
import axios from 'axios';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const API_URL = 'http://192.168.104.45:5000/api';

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

export const getPerformanceData  = async (username: string) => {
  try {
    const response = await axios.get(`${API_URL}/PerformanceData/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching overall performance data:', error);
    throw error;
  }
};


const ApiService = {
  getUserData,
  getPerformanceData,
};

export default ApiService;