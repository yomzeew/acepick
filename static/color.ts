// color.ts
type Theme = "light" | "dark";
type Color = string;

export const getColors = (theme: Theme) => {
  return {
    primaryColor: theme === "light" ? "#33658A" : "#33658A",
    primaryTextColor: theme === "light" ? "#33658A" : "#33658A",
    secondaryTextColor: theme === "light" ? "#000000" : "#ffffff",
    backgroundColor: theme === "light" ? "#ffffff" : "#000000",
    welcomeText: theme === "light" ? "000000" : "#33658A",
    subText: theme === "light" ? "#838BA1" : "#838BA1"
  };
};
