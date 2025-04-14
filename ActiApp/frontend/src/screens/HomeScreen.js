import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { Platform } from 'react-native';
import moment from 'moment';

const getBaseUrl = () => {
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ title: '', category: '', subcategory: '' });
  const [activeActivityId, setActiveActivityId] = useState(null);
  const [duration, setDuration] = useState('00:00:00');
  const timerRef = useRef(null);

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${getBaseUrl()}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al obtener actividades');

      const data = await response.json();
      setActivities(data);

      const current = data.find((a) => a.startTime && !a.endTime);
      if (current) {
        setActiveActivityId(current._id);
        startTimer(new Date(current.startTime));
      } else {
        setActiveActivityId(null);
        clearTimer();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    navigation.replace('Login');
  };

  const handleCreateActivity = async () => {
    const { title, category, subcategory } = newActivity;

    if (!title || !category || !subcategory) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${getBaseUrl()}/api/activities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newActivity,
          organization: user.organizationId || null
        })
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

  const handleStartActivity = async (activityId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const active = activities.find((a) => a.startTime && !a.endTime);
      if (active && active._id !== activityId) {
        await fetch(`${getBaseUrl()}/api/activities/${active._id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ endTime: new Date() })
        });
      }

      await fetch(`${getBaseUrl()}/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startTime: new Date(), endTime: null })
      });

      setActiveActivityId(activityId);
      startTimer(new Date());
      fetchActivities();
    } catch (err) {
      Alert.alert('Error', 'No se pudo iniciar actividad');
    }
  };

  const handleEndActivity = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      await fetch(`${getBaseUrl()}/api/activities/${activeActivityId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endTime: new Date() })
      });

      setActiveActivityId(null);
      clearTimer();
      fetchActivities();
    } catch (err) {
      Alert.alert('Error', 'No se pudo finalizar la actividad');
    }
  };

  const startTimer = (startTime) => {
    clearTimer();
    timerRef.current = setInterval(() => {
      const diff = moment.duration(moment().diff(moment(startTime)));
      const formatted = [
        String(diff.hours()).padStart(2, '0'),
        String(diff.minutes()).padStart(2, '0'),
        String(diff.seconds()).padStart(2, '0')
      ].join(':');
      setDuration(formatted);
    }, 1000);
  };

  const clearTimer = () => {
    clearInterval(timerRef.current);
    setDuration('00:00:00');
    timerRef.current = null;
  };

  useEffect(() => {
    fetchActivities();
    return clearTimer;
  }, []);

  const renderItem = ({ item }) => {
    const isActive = item._id === activeActivityId;
    return (
      <TouchableOpacity
        onPress={() => handleStartActivity(item._id)}
        style={[styles.item, isActive && { backgroundColor: '#f39c12' }]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.category} / {item.subcategory}</Text>
        {item.startTime && (
          <Text style={styles.time}>Inicio: {new Date(item.startTime).toLocaleString()}</Text>
        )}
        {item.endTime && (
          <Text style={styles.time}>Fin: {new Date(item.endTime).toLocaleString()}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
          <Text style={styles.welcome}>👋 {user?.firstName} ({user?.role})</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>🔓 Logout</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.historyButton}>🗂 Ver Historial</Text>
        </TouchableOpacity>
      </View>

      {activeActivityId && (
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>⏱ Tiempo en ejecución:</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerBig}>{duration}</Text>
            <TouchableOpacity style={styles.endButton} onPress={handleEndActivity}>
              <Text style={styles.endButtonText}>⏹ Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>➕ Nueva Actividad</Text>
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
          <Text style={styles.buttonText}>Crear Actividad</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f6fa' },
  header: { marginBottom: 10 },
  welcome: { fontSize: 16, fontWeight: 'bold' },
  logout: { color: '#e74c3c', fontWeight: 'bold' },
  historyButton: {
    color: '#2980b9',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right'
  },
  timerBox: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  timerText: { color: '#fff', fontSize: 16 },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  timerBig: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  endButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  endButtonText: { color: '#fff', fontWeight: 'bold' },
  form: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  time: { fontSize: 12, color: '#555' }
});

export default HomeScreen;
