import { Stack } from "expo-router";


export default function ChatCallLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mainchat/[id]" />
      <Stack.Screen name="callchat/[id]" />
      <Stack.Screen name="callAnswer/[id]" />

    
    </Stack>

 
  );
}
