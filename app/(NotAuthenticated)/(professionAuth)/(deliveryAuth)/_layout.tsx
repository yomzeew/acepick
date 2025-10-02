import { Stack } from "expo-router";

export default function DeliveryAuthLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen 
        name="deliverykyclayout" 
        options={{ title: "login Screen" }}
      />
    
     
    </Stack>
  );
}
