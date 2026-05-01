import axios from 'axios';
import { buildApiUrl } from '../config/api';

const API_URL = buildApiUrl('/api/auth');

// 🔵 Iniciar sesión
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data; // { token, user }
  } catch (error) {
    const message = error.response?.data?.message || 'Error al iniciar sesión';
    throw new Error(message);
  }
};

// 🟣 Obtener perfil del usuario logueado usando el token
export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { user }
  } catch (error) {
    const message = error.response?.data?.message || 'Error al cargar usuario';
    throw new Error(message);
  }
};
