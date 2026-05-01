import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { getBaseUrl } from '../config/api';

const ConfigScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [newActivity, setNewActivity] = useState({ title: '', category: '', subcategory: '' });

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.category || !newActivity.subcategory) {
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
        body: JSON.stringify(newActivity)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear actividad');
      }

      Alert.alert('Éxito', 'Actividad creada correctamente');
      setNewActivity({ title: '', category: '', subcategory: '' });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚙️ Configuración</Text>
      <Text style={styles.subtitle}>Crear Nueva Actividad</Text>

      <TextInput
        placeholder="Título"
        value={newActivity.title}
        onChangeText={text => setNewActivity(prev => ({ ...prev, title: text }))}
        style={styles.input}
      />
      <TextInput
        placeholder="Categoría"
        value={newActivity.category}
        onChangeText={text => setNewActivity(prev => ({ ...prev, category: text }))}
        style={styles.input}
      />
      <TextInput
        placeholder="Subcategoría"
        value={newActivity.subcategory}
        onChangeText={text => setNewActivity(prev => ({ ...prev, subcategory: text }))}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateActivity}>
        <Text style={styles.buttonText}>➕ Crear Actividad</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>🔙 Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#34495E' },
  subtitle: { fontSize: 18, marginBottom: 20, color: '#7F8C8D' },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16
  },
  button: {
    backgroundColor: '#F39C12',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 }
});

export default ConfigScreen;
