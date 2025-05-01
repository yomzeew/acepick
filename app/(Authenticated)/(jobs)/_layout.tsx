import FooterprofessionalComp from "component/professionalDashboard/footerprofessionalComp";
import { Stack } from "expo-router";

import { View,Text } from "react-native";

export default function JobsLayout() {
  return (
    <>
      <Stack 
        screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen
      name="notificationLayout"
       />
         <Stack.Screen
      name="clientProfileLayout"
       />
         <Stack.Screen
      name="invoiceViewLayout"
       />
         <Stack.Screen
      name="jobstatusLayout"
       />
            <Stack.Screen
      name="joborderLayout"
       />
       
    </Stack>
    
    </>
  
  );
}
