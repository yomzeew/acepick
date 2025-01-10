import { Stack } from "expo-router";
import "../global.css"; // Ensure the path is correct
import { ThemeProvider } from "../hooks/useTheme";

export default function RootLayout() {
    const auth:boolean=false
  return (
    <ThemeProvider>
    <Stack screenOptions={{ headerShown: false }}>
      {auth?<Stack.Screen name="(Authenticated)" />:<Stack.Screen name="(NotAuthenticated)" />}
    </Stack>
    </ThemeProvider>
  );
}
