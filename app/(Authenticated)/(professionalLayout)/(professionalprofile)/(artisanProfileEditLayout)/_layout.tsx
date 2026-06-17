import { Stack } from "expo-router";

export default function ArtisanProfileEditLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="certificationLayoutEdit" />
      <Stack.Screen name="educationLayoutEdit" />
      <Stack.Screen name="languageLayoutEdit" />
      <Stack.Screen name="overViewLayoutEdit" />
      <Stack.Screen name="portfolioLayoutEdit" />
      <Stack.Screen name="professionalLayoutEdit" />
      <Stack.Screen name="workExpLayoutEdit" />
    </Stack>
  );
}
