import { createStackNavigator } from '@react-navigation/stack';
import GigHomeScreen from '../screens/gigWorker/GigHomeScreen';

const Stack = createStackNavigator();

export default function GigHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GigHomeMain" component={GigHomeScreen} />
    </Stack.Navigator>
  );
}
