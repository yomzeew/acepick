import React, { useCallback } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import "../global.css"; // Ensure the path is correct
import { ThemeProvider } from "../hooks/useTheme";
import AppProvider from "./appProvider";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    TTFirsNeue: require("../assets/fonts/TTFirsNeueTrialVarRoman.ttf"),
    TTFirsNeueMedium: require("../assets/fonts/TTFirsNeueTrialMedium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <AppProvider>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
        </View>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <RootContent onLayoutRootView={onLayoutRootView} />
    </AppProvider>
  );
}

const RootContent = ({ onLayoutRootView }: { onLayoutRootView: () => void }) => {
  const auth = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <ThemeProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }}>
          {auth ? (
            <Stack.Screen name="(Authenticated)" />
          ) : (
            <Stack.Screen name="(NotAuthenticated)" />
          )}
        </Stack>
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
});
