import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <>

      <Stack 
    screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen name="reviewlayout"   />
      <Stack.Screen name="profilesettinglayout" />
      <Stack.Screen name="profileeditlayout" />
      <Stack.Screen name="notificationapplayout" />
      <Stack.Screen name="billhistorylayout" />
      <Stack.Screen name="faqlayout" />
    </Stack>
  
    
    </>
  
  );
}