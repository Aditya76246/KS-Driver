import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

const Stack = createStackNavigator();


export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* ── Root screen ── */}
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />

      {/* ── Inner screens ── */}
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />

      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />

    </Stack.Navigator>
  );
}