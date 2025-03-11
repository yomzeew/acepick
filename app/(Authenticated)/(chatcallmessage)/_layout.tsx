import { Stack } from "expo-router";


export default function ChatCallLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mainchat/[userid]" />
    
    </Stack>

 
  );
}
