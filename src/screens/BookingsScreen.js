import { View, Text } from "react-native";
import CustomText from "../components/CustomText";
import globalStyles from "../styles/globalStyles";
import { color } from "../styles/theme";

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Bookings Screen</CustomText>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  }
}