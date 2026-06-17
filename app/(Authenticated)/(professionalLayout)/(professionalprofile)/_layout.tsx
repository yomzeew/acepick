import { Stack } from "expo-router";


export default function ProfessionalProfilepagesLayout() {
  return (
    
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="professionalSettingLayout" />
      <Stack.Screen name="corporateReglayout" />
      <Stack.Screen name="artisanSettingLayout" />
      <Stack.Screen name="supportlayout" />
      <Stack.Screen name="termsandprivacylayout" />
      <Stack.Screen name="profileeditlayout" />
      <Stack.Screen name="faqlayout" />
      <Stack.Screen name="passwordchangelayout" />
      <Stack.Screen name="billhistorylayout" />
    </Stack> 
  );
}
