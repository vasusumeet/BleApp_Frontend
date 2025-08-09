import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './src/Screens/home';
import Connect from './src/Screens/Connect';
import ConnectedDevices from './src/Screens/ConnectedDevices';
import { ConnectedDevicesProvider } from './src/ConnectedDevicesContext';
import ViewData from './src/Screens/ViewData';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ConnectedDevicesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ title: 'Home' }}
          />
          <Stack.Screen
            name="Connect"
            component={Connect}
            options={{ title: 'BLE Connect' }}
          />
          <Stack.Screen
            name="ConnectedDevices"
            component={ConnectedDevices}
            options={{ title: 'Connected Devices' }}
          />
          <Stack.Screen
            name="ViewData"
            component={ViewData}
            options={{ title: 'ViewData' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ConnectedDevicesProvider>
  );
}
