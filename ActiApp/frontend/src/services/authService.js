import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth"; // Cambia esto según el backend

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error al iniciar sesión";
  }
};
