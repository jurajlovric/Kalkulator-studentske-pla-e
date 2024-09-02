// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen'; // Dashboard ekran
import WorkHoursList from './screens/WorkHoursList'; // Prikaz radnih sati
import MonthlyHours from './screens/MonthlyHours'; // Dodavanje MonthlyHours

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WorkHoursList" component={WorkHoursList} options={{ headerShown: false }} />
        <Stack.Screen name="MonthlyHours" component={MonthlyHours} options={{ headerShown: false }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
