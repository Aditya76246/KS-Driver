import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutScreen from '../screens/AboutScreen';
import SpeechCommandDemoScreen from '../screens/SpeechCommandDemoScreen';
import ChooseLanguage from '../components/ChooseLanguage';

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

      <Stack.Screen
        name="ChooseLanguage"
        component={ChooseLanguage}
        options={{ tabBarStyle: { display: 'none' } }}
      />

      <Stack.Screen
        name="terms"
        component={TermsScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />

      <Stack.Screen
        name="privacy"
        component={PrivacyPolicyScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />

      <Stack.Screen
        name="help"
        component={HelpSupportScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />

      <Stack.Screen
        name="SpeechCommandDemo"
        component={SpeechCommandDemoScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />

      <Stack.Screen
        name="about"
        component={AboutScreen}
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />

    </Stack.Navigator>
  );
}
