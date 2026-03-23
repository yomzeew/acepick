import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useColorScheme, Appearance } from "react-native";
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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const systemTheme = useColorScheme();

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const manual = await AsyncStorage.getItem(THEME_MANUAL_KEY);
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (manual === 'true' && savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
          setIsManual(true);
        } else if (systemTheme) {
          setThemeState(systemTheme);
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
        if (systemTheme) {
          setThemeState(systemTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Listen for device theme changes — sync if user hasn't manually overridden
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (!isManual && colorScheme) {
        setThemeState(colorScheme);
      }
    });
    return () => listener.remove();
  }, [isManual]);

  // Also sync on systemTheme changes (covers initial + background)
  useEffect(() => {
    if (!isLoading && !isManual && systemTheme) {
      setThemeState(systemTheme);
    }
  }, [systemTheme, isLoading, isManual]);

  // Save theme to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
          console.warn('Failed to save theme to storage:', error);
        }
      };
      saveTheme();
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

  // Don't render children until theme is loaded
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
