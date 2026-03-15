// color.ts
type Theme = "light" | "dark";
type Color = string;



export const getColors = (theme: Theme) => {
  return {
    primaryColor: theme === "light" ? "#59C5E0" : "#31B7D8",
    primaryTextColor: theme === "light" ? "#33658A" : "#59C5E0",
    secondaryTextColor: theme === "light" ? "#171717" : "#E5E7EB", // Much lighter for dark mode
    textColor: theme === "light" ? "#033A62" : "#F3F4F6", // Lighter for dark mode
    backgroundColor: theme === "light" ? "#FAF8F8" : "#1F2937", // Darker background
    backgroundColortwo: theme === "light" ? "#33658A" : "#111827", // Darker secondary background
    welcomeText: theme === "light" ? "#000000" : "#F9FAFB", // Lighter for dark mode
    subText: theme === "light" ? "#838BA1" : "#9CA3AF", // Lighter for dark mode
    selectioncardColor: theme === "light" ? "#ffffff" : "#374151", // Darker card background
    borderColor: theme === "light" ? "#E5E7EB" : "#4B5563", // Border colors
    errorColor: theme === "light" ? "#DC2626" : "#EF4444", // Error colors
    successColor: theme === "light" ? "#059669" : "#10B981", // Success colors
    warningColor: theme === "light" ? "#D97706" : "#F59E0B", // Warning colors
  };
};



