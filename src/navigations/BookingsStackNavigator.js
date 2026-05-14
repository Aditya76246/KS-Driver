import { createStackNavigator } from '@react-navigation/stack';
import BookingsScreen from '../screens/BookingsScreen';

const Stack = createStackNavigator();

export default function BookingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsMain" component={BookingsScreen} />
    </Stack.Navigator>
  );
}
