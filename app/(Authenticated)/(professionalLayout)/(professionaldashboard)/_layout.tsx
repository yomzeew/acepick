import FooterprofessionalComp from "component/professionalDashboard/footerprofessionalComp";
import { Stack } from "expo-router";

import { View,Text } from "react-native";

export default function ProfessionalDashboard() {
  return (
    <>
      <Stack 
    screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen 
        name="homeprofessionalayout" 
      />
      <Stack.Screen
      name="profileprofessionlayout"
       />
    <Stack.Screen
      name="chatlayout"
       />
       
    </Stack>
    <View className="w-screen items-center  absolute bottom-0">
     <FooterprofessionalComp/>
    </View>
    
    </>
  
  );
}
