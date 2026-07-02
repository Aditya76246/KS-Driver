import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';

import ProfileScreen         from '../screens/ProfileScreen';
import PersonalInfoScreen    from '../screens/PersonalInfoScreen';
import GigPersonalInfoScreen from '../screens/gigWorker/GigPersonalInfoScreen';
import DocumentsScreen       from '../screens/DocumentsScreen';
import TermsScreen           from '../screens/TermsScreen';
import PrivacyPolicyScreen   from '../screens/PrivacyPolicyScreen';
import HelpSupportScreen     from '../screens/HelpSupportScreen';
import AboutScreen           from '../screens/AboutScreen';
import SpeechCommandDemoScreen from '../screens/SpeechCommandDemoScreen';
import ChooseLanguage        from '../components/ChooseLanguage';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  const { userRole } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="ProfileMain" component={ProfileScreen} />

      <Stack.Screen
        name="PersonalInfo"
        component={userRole === 'gigWorker' ? GigPersonalInfoScreen : PersonalInfoScreen}
        options={{ tabBarStyle: { display: 'none' } }}
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
        options={{ tabBarStyle: { display: 'none' } }}
      />

    </Stack.Navigator>
  );
}
