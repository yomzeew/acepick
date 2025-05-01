import { Stack } from "expo-router";

export default function ProfessionalAuthLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="professionalkyconelayout" 
        options={{ title: "Kyc Screen" }}
      />
      <Stack.Screen 
        name="professionalkyctwolayout" 
        options={{ title: "recover password Screen" }}
      />
      <Stack.Screen 
        name="directorkyclayout" 
        options={{ title: "password recover code Screen" }}
      />
     
    </Stack>
  );
}
