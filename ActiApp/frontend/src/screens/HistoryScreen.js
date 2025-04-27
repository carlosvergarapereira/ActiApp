import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

const getBaseUrl = () => Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

const HistoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${getBaseUrl()}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const finished = data.filter(act => act.startTime && act.endTime);
      setActivities(finished);
    } catch (error) {
      console.error('Error al cargar historial', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowCalendar(false);
  };

  const formattedSelectedDate = moment(selectedDate).format('YYYY-MM-DD');
  const filteredActivities = activities.filter(act =>
    moment(act.startTime).format('YYYY-MM-DD') === formattedSelectedDate
  );

  const chartData = filteredActivities.map((act) => {
    const start = moment(act.startTime);
    const end = moment(act.endTime);
    const durationHours = moment.duration(end.diff(start)).asHours();
    return { x: act.title, y: durationHours };
  });

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
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#F39C12" />
        </TouchableOpacity>
        <Text style={styles.header}>📄 Historial de Actividades</Text>
      </View>

      <TouchableOpacity style={styles.calendarButton} onPress={() => setShowCalendar(true)}>
        <MaterialIcons name="calendar-today" size={22} color="#F39C12" />
        <Text style={styles.calendarText}>{moment(selectedDate).format('DD/MM/YYYY')}</Text>
      </TouchableOpacity>

      {showCalendar && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <>
          {chartData.length > 0 ? (
            <>
              <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 50, y: 20 }}>
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 12, padding: 5 }
                  }}
                />
                <VictoryAxis
                  style={{
                    tickLabels: { fontSize: 9, padding: 10, angle: 25 } // MÁS PEQUEÑO Y MÁS RECTO
                  }}
                />
                <VictoryBar
                  data={chartData}
                  style={{
                    data: { fill: "#F39C12" }
                  }}
                  barWidth={20}
                />
              </VictoryChart>

              <FlatList
                data={filteredActivities}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </>
          ) : (
            <View style={styles.noActivities}>
              <Text style={styles.noActivitiesText}>🚫 Sin actividades para la fecha seleccionada</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f6fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginLeft: 10 },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20
  },
  calendarText: { marginLeft: 10, fontSize: 16, color: '#34495E' },
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
  duration: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  noActivities: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  noActivitiesText: { fontSize: 18, color: '#7f8c8d', textAlign: 'center' }
});

export default HistoryScreen;
