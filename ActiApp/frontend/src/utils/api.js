import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl } from '../config/api';

const fetchApi = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }), // Añade el token si existe
  };

  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return await response.json();
};

export default fetchApi;