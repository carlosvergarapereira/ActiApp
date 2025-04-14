import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("🔐 TOKEN:", token); // <--- DEBUG
      if (!token) {
        Alert.alert('Error', 'No hay token de sesión');
        return;
      }

      const response = await fetch('http://10.0.2.2:5000/api/activities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Sesión expirada", "Por favor inicia sesión nuevamente.");
          await AsyncStorage.removeItem('token');
          navigation.replace('Login');
        }
        throw new Error('Error al obtener actividades');
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error al obtener actividades:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 15,
        backgroundColor: '#f1f1f1',
        marginVertical: 5,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ color: '#555' }}>{item.category} > {item.subcategory}</Text>
      {item.startTime && (
        <Text style={{ fontSize: 12, color: 'green' }}>
          Inicio: {new Date(item.startTime).toLocaleString()}
        </Text>
      )}
      {item.endTime && (
        <Text style={{ fontSize: 12, color: 'red' }}>
          Fin: {new Date(item.endTime).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando actividades...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Bienvenido, {user?.firstName} ({user?.role})
      </Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default HomeScreen;
