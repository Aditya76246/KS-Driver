import { createStackNavigator } from '@react-navigation/stack';
import BookingsScreen from '../screens/BookingsScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';

const Stack = createStackNavigator();

export default function BookingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsMain" component={BookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{tabBarStyle:{display:'none'}}} />
    </Stack.Navigator>
  );
}
