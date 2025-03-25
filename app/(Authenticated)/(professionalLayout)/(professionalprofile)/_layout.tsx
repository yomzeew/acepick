import { Stack } from "expo-router";


export default function ProfessionalProfilepagesLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="professionalSettingLayout" />
      <Stack.Screen name="corporateReglayout" />
    </Stack> 
  );
}
