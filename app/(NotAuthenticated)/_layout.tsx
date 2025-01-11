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
      <Stack.Screen 
        name="welcomescreen" 
        options={{ title: "Welcome Screen" }}
      />
      <Stack.Screen 
        name="loginscreen" 
        options={{ title: "login Screen" }}
      />
       <Stack.Screen 
        name="registerscreen" 
        options={{ title: "register Screen" }}
      />
        <Stack.Screen 
        name="emailverificationscreen" 
        options={{ title: "email verification Screen" }}
      />
       <Stack.Screen 
        name="clientregistrationscreen" 
        options={{ title: "client registration Screen" }}
      />
    </Stack>
  );
}
