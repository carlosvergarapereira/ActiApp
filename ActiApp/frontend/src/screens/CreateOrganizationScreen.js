import React, { useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import fetchApi from '../utils/api';

const CreateOrganizationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name, type }),
      });

      Alert.alert('Éxito', 'Organización creada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating organization:', error);
      Alert.alert('Error', error.message || 'No se pudo crear la organización.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nombre" onChangeText={setName} />
      <TextInput placeholder="Tipo" onChangeText={setType} />
      <Button title="Crear organización" onPress={handleCreate} disabled={loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default CreateOrganizationScreen;