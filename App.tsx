/**
 * Lender App
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/AppContext';
import HomeScreen from './screens/HomeScreen';
import AddPersonScreen from './screens/AddPersonScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppProvider>
          <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'Lender App',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    style={{ marginRight: 16 }}
                  >
                    <Text style={{ fontSize: 24 }}>⚙️</Text>
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen name="AddPerson" component={AddPersonScreen} options={{ title: 'Add Person' }} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
