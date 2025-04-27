import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const AuthLoadingScreen = ({ children }) => {
  const { loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F39C12" />
        <Text style={styles.text}>Iniciando sesión...</Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#34495E',
  },
});

export default AuthLoadingScreen;
