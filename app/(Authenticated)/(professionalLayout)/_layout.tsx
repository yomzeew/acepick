import { Stack } from "expo-router";


export default function ProfessionalLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(professionaldashboard)" />
      <Stack.Screen name="(professionalprofile)" />
    </Stack>

 
  );
}
