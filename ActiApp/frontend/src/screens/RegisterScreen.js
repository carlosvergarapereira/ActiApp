import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000';

const RegisterScreen = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    organizationId: '',
  });

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/organizations`);
      const data = await res.json();
  
      if (!Array.isArray(data)) {
        throw new Error(data.message || 'Organizaciones no disponibles');
      }
  
      setOrganizations(data);
    } catch (err) {
      console.error("❌ Error al cargar organizaciones:", err);
      Alert.alert("Error", "No se pudieron cargar las organizaciones");
      setOrganizations([]); // Evitar crash
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleRegister = async () => {
    const { username, firstName, lastName, email, password, role, organizationId } = form;

    if (!username || !firstName || !lastName || !email || !password || !organizationId) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.message || 'Error al registrar');
      }

      // Autologin al registrar
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
 
      const loginData = await loginRes.json();
      console.log("🧠 loginData.user:", loginData.user);
      console.log("🔁 Respuesta de login auto:", loginData);
      console.log("🧠 loginData.token:", loginData.token);


      if (!loginRes.ok || !loginData.token || !loginData.user) {
        throw new Error('No se pudo iniciar sesión automáticamente');
      }

      await AsyncStorage.setItem('token', loginData.token);
      setUser(loginData.user);

      Alert.alert('✅ Bienvenido', 'Registro e inicio de sesión exitosos');
      navigation.replace('Home');

    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Usuario</Text>

      {['username', 'firstName', 'lastName', 'email', 'password'].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          secureTextEntry={field === 'password'}
          value={form[field]}
          onChangeText={(value) => handleChange(field, value)}
        />
      ))}

      <Picker
        selectedValue={form.role}
        onValueChange={(value) => handleChange('role', value)}
        style={styles.input}
      >
        <Picker.Item label="Usuario regular" value="user" />
        <Picker.Item label="Admin de organización" value="admin_org" />
      </Picker>

      <Picker
        selectedValue={form.organizationId}
        onValueChange={(value) => handleChange('organizationId', value)}
        style={styles.input}
      >
        <Picker.Item label="Seleccione organización" value="" />
        {organizations.map((org) => (
          <Picker.Item key={org._id} label={org.name} value={org._id} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={{ marginTop: 15, color: '#3498db' }}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default RegisterScreen;
