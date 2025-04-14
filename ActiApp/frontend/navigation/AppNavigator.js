import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import CreateOrganizationScreen from '../screens/CreateOrganizationScreen'; // Importa la pantalla
import CreateActivityScreen from '../screens/CreateActivityScreen'; // Importa la pantalla
import { AuthContext } from '../context/AuthContext'; // Importa el contexto de autenticación

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext); // Obtén el usuario y el estado de carga

  if (loading) {
    return null; // O un componente de carga mientras se verifica el token
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? ( // Si hay un usuario autenticado
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateOrganization" component={CreateOrganizationScreen} />
            <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
            <Stack.Screen name="Activities" component={ActivitiesScreen} />
            {/* ... otras pantallas protegidas */}
          </>
        ) : ( // Si no hay un usuario autenticado
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;