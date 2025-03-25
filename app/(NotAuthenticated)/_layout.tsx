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
        name="verificationsuccess" 
        options={{ title: "verification success Screen" }}
      />
       <Stack.Screen 
        name="clientregistrationscreen" 
        options={{ title: "client registration Screen" }}
      />
      <Stack.Screen 
        name="passwordconfirmscreen" 
        options={{ title: "password confirm screen" }}
      />
      <Stack.Screen 
        name="accountsuccessscreen" 
        options={{ title: "account success screen" }}
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
    </Stack>
  );
}
