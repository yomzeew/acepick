import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_STORAGE_KEY = '@acepick_theme';
const THEME_MANUAL_KEY = '@acepick_theme_manual';

// Read synchronously so the initial state is always correct on iOS and Android.
// useColorScheme() can return null on iOS during the first render; Appearance.getColorScheme()
// is the synchronous equivalent and is reliable across platforms.
const getSystemTheme = (): Theme => Appearance.getColorScheme() ?? 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getSystemTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);

  // useColorScheme is still useful for re-renders triggered by system changes
  const systemScheme = useColorScheme();

  // On mount: check AsyncStorage. If the user previously set a manual preference,
  // honour it; otherwise keep the synchronous system value already in state.
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const [manual, savedTheme] = await Promise.all([
          AsyncStorage.getItem(THEME_MANUAL_KEY),
          AsyncStorage.getItem(THEME_STORAGE_KEY),
        ]);
        if (manual === 'true' && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
          setIsManual(true);
        }
        // else: stay on the system value already set by useState(getSystemTheme)
      } catch {
        // storage unreadable — keep system value
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Keep in sync when the OS appearance changes while the app is running
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (!isManual && colorScheme) {
        setThemeState(colorScheme);
      }
    });
    return () => listener.remove();
  }, [isManual]);

  // Also react to useColorScheme() changes (covers some edge cases on iOS 13+)
  useEffect(() => {
    if (!isLoading && !isManual && systemScheme) {
      setThemeState(systemScheme);
    }
  }, [systemScheme, isLoading, isManual]);

  // Persist theme to storage whenever it changes (after initial load)
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch(() => {});
    }
  }, [theme, isLoading]);

  const setTheme = useCallback((newTheme: Theme) => {
    setIsManual(true);
    AsyncStorage.setItem(THEME_MANUAL_KEY, 'true').catch(() => {});
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsManual(true);
    AsyncStorage.setItem(THEME_MANUAL_KEY, 'true').catch(() => {});
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // No loading gate needed — initial state is already the correct system value,
  // so children render immediately without a flash of wrong theme.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
