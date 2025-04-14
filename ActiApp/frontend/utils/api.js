// frontend/utils/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000'; // Cambia si usas IP real o producción

const fetchApi = async (endpoint, method = 'GET', body = null) => {
  const token = await AsyncStorage.getItem('token');

  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { data: body } : {}),
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('❌ fetchApi error:', error.response || error.message);
    throw error.response?.data?.message || 'Error de conexión con el servidor';
  }
};

export default fetchApi;
