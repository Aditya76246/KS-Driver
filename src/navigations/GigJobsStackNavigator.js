import { createStackNavigator } from '@react-navigation/stack';
import GigJobsScreen from '../screens/gigWorker/GigJobsScreen';

const Stack = createStackNavigator();

export default function GigJobsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GigJobsMain" component={GigJobsScreen} />
    </Stack.Navigator>
  );
}
