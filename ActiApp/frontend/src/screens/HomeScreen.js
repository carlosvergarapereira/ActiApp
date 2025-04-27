import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import { Platform } from 'react-native';

const getBaseUrl = () => Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeActivityId, setActiveActivityId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState('00:00:00');
  const timerRef = useRef(null);

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${getBaseUrl()}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActivities(data);

      const current = data.find(a => a.startTime && !a.endTime);
      if (current) {
        setActiveActivityId(current._id);
        setStartTime(new Date(current.startTime));
        startTimer(new Date(current.startTime));
      } else {
        setActiveActivityId(null);
        clearTimer();
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    navigation.replace('Login');
  };

  const startTimer = (start) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = moment.duration(moment().diff(moment(start)));
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

  const handleStartActivity = async (activityId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (activeActivityId && activeActivityId !== activityId) {
        await fetch(`${getBaseUrl()}/api/activities/${activeActivityId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ endTime: new Date() })
        });
      }

      await fetch(`${getBaseUrl()}/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: new Date(), endTime: null })
      });

      setActiveActivityId(activityId);
      setStartTime(new Date());
      startTimer(new Date());
      fetchActivities();
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar actividad');
    }
  };

  const handleEndActivity = async () => {
    if (!activeActivityId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${getBaseUrl()}/api/activities/${activeActivityId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime: new Date() })
      });
      setActiveActivityId(null);
      clearTimer();
      fetchActivities();
    } catch (err) {
      Alert.alert('Error', 'No se pudo finalizar actividad');
    }
  };

  useEffect(() => {
    fetchActivities();
    return clearTimer;
  }, []);

  const renderItem = ({ item }) => {
    const isActive = item._id === activeActivityId;
    return (
      <TouchableOpacity onPress={() => handleStartActivity(item._id)} style={[styles.card, isActive && { backgroundColor: '#fde3a7' }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>{item.category} / {item.subcategory}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleMain}>👋 Hola, {user?.firstName}</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Config')}>
            <MaterialIcons name="settings" size={28} color="#F39C12" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <MaterialIcons name="history" size={28} color="#F39C12" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={28} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {activeActivityId && (
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>⏱ Actividad en progreso</Text>
          <Text style={styles.timerBig}>{duration}</Text>
          <TouchableOpacity onPress={handleEndActivity}>
            <MaterialIcons name="stop-circle" size={36} color="#e74c3c" style={{ marginTop: 10 }} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#F39C12" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleMain: { fontSize: 22, fontWeight: 'bold', color: '#34495E' },
  iconRow: { flexDirection: 'row', gap: 15 },
  timerBox: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  timerText: { color: '#fff', fontSize: 16 },
  timerBig: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, borderColor: '#ddd', borderWidth: 1 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
});

export default HomeScreen;
