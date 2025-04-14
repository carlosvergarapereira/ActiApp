import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

const API_URL = 'http://localhost:5000';

const ActivitiesScreen = () => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ title: '', category: '', subcategory: '' });
  const [timer, setTimer] = useState('');

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = async (activityId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const activeActivity = activities.find(a => a.startTime && !a.endTime);
      if (activeActivity && activeActivity._id !== activityId) {
        await fetch(`${API_URL}/api/activities/${activeActivity._id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endTime: new Date() }),
        });
      }

      await fetch(`${API_URL}/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startTime: new Date(), endTime: null }),
      });

      await fetchActivities();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo iniciar la actividad');
    }
  };

  const handleCreateActivity = async () => {
    const { title, category, subcategory } = newActivity;

    if (!title || !category || !subcategory) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/activities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newActivity,
          organization: user.organizationId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al crear actividad');
      }

      setNewActivity({ title: '', category: '', subcategory: '' });
      fetchActivities();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // ⏱️ Actualiza el cronómetro en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const active = activities.find(a => a.startTime && !a.endTime);
      if (active?.startTime) {
        const duration = moment.duration(moment().diff(moment(active.startTime)));
        const formatted = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
        setTimer(formatted);
      } else {
        setTimer('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activities]);

  const renderItem = ({ item }) => {
    const isActive = item.startTime && !item.endTime;
    return (
      <TouchableOpacity
        onPress={() => handleStartActivity(item._id)}
        style={[styles.item, isActive && { backgroundColor: '#f39c12' }]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.category} / {item.subcategory}</Text>
        {item.startTime && (
          <Text style={styles.time}>Inicio: {moment(item.startTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
        )}
        {item.endTime && (
          <Text style={styles.time}>Fin: {moment(item.endTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
        )}
        {isActive && (
          <Text style={styles.counter}>🟢 Tiempo actual: {timer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Actividades</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Título"
          value={newActivity.title}
          onChangeText={(text) => setNewActivity(prev => ({ ...prev, title: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Categoría"
          value={newActivity.category}
          onChangeText={(text) => setNewActivity(prev => ({ ...prev, category: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Subcategoría"
          value={newActivity.subcategory}
          onChangeText={(text) => setNewActivity(prev => ({ ...prev, subcategory: text }))}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateActivity}>
          <Text style={styles.buttonText}>➕ Crear Actividad</Text>
        </TouchableOpacity>
      </View>

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
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: {
    padding: 15,
    marginVertical: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  time: { fontSize: 12, color: '#2c3e50' },
  counter: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  form: { marginVertical: 15 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default ActivitiesScreen;
