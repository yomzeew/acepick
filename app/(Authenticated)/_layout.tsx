import { Stack } from "expo-router";


export default function AuthenticatedLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen  name="(dashboard)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(wallet)" />
      <Stack.Screen name="(profession)" />
      <Stack.Screen name="(chatcallmessage)" />
      <Stack.Screen name="(professionalLayout)" />
      <Stack.Screen name="(jobs)" />
    </Stack>

 
  );
}
