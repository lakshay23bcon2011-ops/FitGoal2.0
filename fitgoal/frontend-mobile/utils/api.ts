import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Use host.docker.internal for Android emulator if backend is in docker,
// or use the machine's local IP address.
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('fitgoal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired or invalid tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await SecureStore.deleteItemAsync('fitgoal_token');
      await SecureStore.deleteItemAsync('fitgoal_user');
      // In a real app, you would trigger a navigation to the login screen here
    }
    return Promise.reject(error);
  }
);

export default api;
