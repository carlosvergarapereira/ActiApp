import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import fetchApi from '../utils/api';

const CreateActivityScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/activities', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          subcategory,
          organization: user.organization,
        }),
      });

      Alert.alert('Éxito', 'Actividad creada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la actividad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput placeholder="Título" onChangeText={setTitle} />
      <TextInput placeholder="Categoría" onChangeText={setCategory} />
      <TextInput placeholder="Subcategoría" onChangeText={setSubcategory} />
      <Button title="Crear actividad" onPress={handleCreate} disabled={loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default CreateActivityScreen;