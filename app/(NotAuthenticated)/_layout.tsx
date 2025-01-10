import { Stack } from "expo-router";

export default function NotAuthenticatedLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: "Splash Screen" }} // Custom title for the "home" screen
      />
    </Stack>
  );
}
