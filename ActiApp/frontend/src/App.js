import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import HistoryScreen from './screens/HistoryScreen';
import ConfigScreen from './screens/ConfigScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Config" component={ConfigScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
