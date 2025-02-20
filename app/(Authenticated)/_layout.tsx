import { Stack } from "expo-router";


export default function AuthenticatedLayout() {
  return (
    
       <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen  name="(dashboard)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(walet)" />
    
    </Stack>

 
  );
}
