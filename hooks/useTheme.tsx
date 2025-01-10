import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light", // Default theme
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const systemTheme = useColorScheme(); // Get the current system theme

  useEffect(() => {
    // Set theme based on system color scheme
    if (systemTheme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [systemTheme]); // Only runs when system theme changes

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
