import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Importa el contexto
import fetchApi from '../utils/api'; // Importa la función fetchApi

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga
  const { login } = useContext(AuthContext); // Obtén la función login del contexto

  const handleLogin = async () => {
    setLoading(true); // Indica que la carga ha comenzado
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      await login(data.token); // Guarda el token y la info del usuario en el contexto
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', error.message || 'Hubo un problema al iniciar sesión'); // Muestra el mensaje de error del backend o uno genérico
    } finally {
      setLoading(false); // Indica que la carga ha terminado
    }
  };

  return (
    <View>
      <TextInput placeholder="Usuario" onChangeText={setUsername} />
      <TextInput placeholder="Contraseña" onChangeText={setPassword} secureTextEntry />
      <Button title="Iniciar sesión" onPress={handleLogin} disabled={loading} /> {/* Deshabilita el botón mientras carga */}
      {loading && <ActivityIndicator />} {/* Muestra el indicador de carga si loading es true */}
    </View>
  );
};

export default LoginScreen;