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
        name="recoverpasswordscreen" 
        options={{ title: "recover password screen" }}
      />
      <Stack.Screen 
        name="verifyotpscreen" 
        options={{ title: "verify otp screen" }}
      />
      <Stack.Screen 
        name="createnewpasswordscreen" 
        options={{ title: "create new password screen" }}
      />
      <Stack.Screen 
        name="passwordchangesuccessscreen" 
        options={{ title: "password change success screen" }}
      />
      <Stack.Screen
      name="bvnscreen"
      options={{title:"bvn screen payment"}}
      />
         <Stack.Screen
      name="(professionAuth)"
      options={{title:"profession Auth screen"}}
      />
      <Stack.Screen
        name="onboarding-client"
        options={{ title: "Client Registration" }}
      />
      <Stack.Screen
        name="onboarding-professional"
        options={{ title: "Professional Registration" }}
      />
      <Stack.Screen
        name="onboarding-delivery"
        options={{ title: "Delivery Registration" }}
      />
    </Stack>
  );
}
