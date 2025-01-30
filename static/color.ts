// color.ts
type Theme = "light" | "dark";
type Color = string;

export const getColors = (theme: Theme) => {
  return {
    primaryColor: theme === "light" ? "#59C5E0" : "#31B7D8",
    primaryTextColor: theme === "light" ? "#31B7D8" : "#59C5E0",
    secondaryTextColor: theme === "light" ? "#171717" : "#ffffff",
    textColor:theme==="light"?"#033A62":"#ffffff",
    backgroundColor: theme === "light" ? "#FAF8F8" : "#171717",
    backgroundColortwo: theme === "light" ? "#33658A" : "#000000",
    welcomeText: theme === "light" ? "#000000" : "#ffffff",
    subText: theme === "light" ? "#838BA1" : "#838BA1",
    selectioncardColor: theme==='light'?'#ffffff':'#333333',
  };
};



