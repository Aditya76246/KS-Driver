import { createStackNavigator } from '@react-navigation/stack';
import EarningsScreen from '../screens/EarningsScreeen';

const Stack = createStackNavigator();

export default function EarningsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EarningsMain" component={EarningsScreen} />
    </Stack.Navigator>
  );
}
