import { Stack } from "expo-router";

export default function ProfessionLayout() {
  return (
    <>

      <Stack 
    screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable sliding back gesture
      }}
    >
      <Stack.Screen name="calllayout"/>
      <Stack.Screen name="category/[profession]" />
    </Stack>
  
    
    </>
  
  );
}