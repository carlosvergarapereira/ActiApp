// frontend/screens/HistoryScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

const HistoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${getBaseUrl()}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const finished = data.filter(act => act.startTime && act.endTime);
      setActivities(finished);
    } catch (error) {
      console.error('Error al obtener historial:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const renderItem = ({ item }) => {
    const start = moment(item.startTime);
    const end = moment(item.endTime);
    const duration = moment.duration(end.diff(start));
    const formattedDuration = [
      String(duration.hours()).padStart(2, '0'),
      String(duration.minutes()).padStart(2, '0'),
      String(duration.seconds()).padStart(2, '0')
    ].join(':');

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.category} / {item.subcategory}</Text>
        <Text style={styles.info}>🟢 Inicio: {start.format('DD/MM/YYYY HH:mm')}</Text>
        <Text style={styles.info}>🔴 Fin: {end.format('DD/MM/YYYY HH:mm')}</Text>
        <Text style={styles.duration}>⏱️ Duración: {formattedDuration}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🗂 Historial de Actividades</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f6fa' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#ddd',
    borderWidth: 1
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  info: { fontSize: 13, color: '#555' },
  duration: { fontSize: 14, fontWeight: 'bold', marginTop: 5 }
});

export default HistoryScreen;
