import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });

    // Esperamos que el backend devuelva { token, user }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Error al iniciar sesión';
    throw new Error(message);
  }
};
