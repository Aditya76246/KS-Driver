import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />

      {/*
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
          options={{ tabBarStyle: { display: 'none' } }}
        />
      */}
    </Stack.Navigator>
  );
}