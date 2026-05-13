import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CustomHeader from "../components/CustomHeader";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        header: () => (
          <CustomHeader
            onProfilePress={() => navigation.navigate("Profile")}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={HomeScreen} />
      <Tab.Screen name="More" component={HomeScreen} />
    </Tab.Navigator>
  );
}
