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
        name="registerrofession" 
        options={{ title: "register Screen" }}
      />
      <Stack.Screen 
        name="professionalkyc" 
        options={{ title: "Kyc Screen" }}
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
        options={{ title: "password  code Screen" }}
      />
       <Stack.Screen 
        name="passwordpagelayout" 
        options={{ title: "password  page" }}
      />
       <Stack.Screen 
        name="termcondition" 
        options={{ title: "Term Condition" }}
      />
      <Stack.Screen 
        name="verificationcodeprofession" 
        options={{ title: "verification Code" }}
      />
     
    </Stack>
  );
}
