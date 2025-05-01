import { Stack } from "expo-router";

export default function ArtisanAuthLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen 
        name="artisankyclayout" 
        options={{ title: "login Screen" }}
      />
    
     
    </Stack>
  );
}
