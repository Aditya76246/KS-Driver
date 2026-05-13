import { View, Text, Button, StyleSheet } from "react-native";
import CustomText from "../components/CustomText";
import globalStyles from "../styles/globalStyles";

export default function LoginScreen({ navigation }) {
  
  const buttonTest=()=>{
    navigation.navigate("Register");
    console.log('Button Clicked');
    
  }
  return (
    <View style={styles.loginContainer}>
      <CustomText style={styles.loginText}>Login Screen</CustomText>
      <Button title="Go to Register" onPress={buttonTest} />
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    ...globalStyles.f14Bold,
    marginBottom:8,
    padding:8,
  }
});