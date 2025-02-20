import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => { // Recibe el objeto navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        navigation.navigate('Home'); // Navega a la pantalla Home
      } else {
        Alert.alert('Error', data.message); // Muestra un mensaje de error
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al iniciar sesión');
    }
  };

  return (
    <View>
      <TextInput placeholder="Usuario" onChangeText={setUsername} />
      <TextInput placeholder="Contraseña" onChangeText={setPassword} secureTextEntry />
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;