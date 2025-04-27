// frontend/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../services/authService'; // 🔥 Nuevo servicio que consulta el perfil
import { Platform } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // 👈 Indicador de carga inicial

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const { user } = await getUserProfile(token);
          setUser(user);
        }
      } catch (error) {
        console.log('❌ Error cargando usuario', error);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
