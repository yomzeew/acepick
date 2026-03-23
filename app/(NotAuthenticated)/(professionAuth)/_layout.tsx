import { Stack } from "expo-router";

export default function ProfessionAuthLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen 
        name="loginprofession" 
        options={{ title: "login Screen" }}
      />
      <Stack.Screen 
        name="selectionlayoutScreen" 
        options={{ title: "selection Screen" }}
      />
      <Stack.Screen 
        name="recoverpasswordprofessional" 
        options={{ title: "recover password Screen" }}
      />
      <Stack.Screen 
        name="passwordrecovercode" 
        options={{ title: "password recover code Screen" }}
      />
      <Stack.Screen 
        name="newpasswordpage" 
        options={{ title: "password code Screen" }}
      />
     
    </Stack>
  );
}
