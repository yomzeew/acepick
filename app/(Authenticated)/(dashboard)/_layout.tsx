import { Stack } from "expo-router";
import FooterComponent from "../../../component/dashboardComponent/footerComponent";
import { View } from "react-native";

export default function DashboardLayout() {
  return (
    <>
      <Stack 
    screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen 
        name="homelayout" 
      />
      <Stack.Screen
      name="profilelayout"
       />
    <Stack.Screen
      name="chatlayout"
       />
       
    </Stack>
    <View className="w-screen items-center  absolute bottom-0">
    <FooterComponent/>
    </View>
    
    </>
  
  );
}
