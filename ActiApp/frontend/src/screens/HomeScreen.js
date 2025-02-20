import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import fetchApi from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Obtén el usuario del contexto

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await fetchApi('/api/activities');
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        Alert.alert('Error', 'No se pudieron cargar las actividades.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View>
      {/* Muestra información del usuario */}
      <Text>Bienvenido, {user?.username}</Text>
      <FlatList
        data={activities}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

export default HomeScreen;