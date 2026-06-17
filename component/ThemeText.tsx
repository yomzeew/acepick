import { ReactNode } from "react"
import { Text, TextStyle } from "react-native"
import { useTheme } from "../hooks/useTheme"
import { getColors } from "../static/color";

interface ThemeTextProps {
  children: ReactNode;
  size: TextStyle;
  type?: 'primary' | 'secondary';
  className?: string;
  style?: TextStyle;
}

export const ThemeText: React.FC<ThemeTextProps> = ({ 
  children, 
  size, 
  type = 'primary', 
  className = "",
  style 
}) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  
  return (
    <Text 
      style={[size, { color: type === 'secondary' ? secondaryTextColor : primaryTextColor }, style]}
      className={className}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

interface ThemeTextSecondProps {
  children: ReactNode;
  size?: TextStyle;
  className?: string;
}

export const ThemeTextsecond: React.FC<ThemeTextSecondProps> = ({ children, size, className = "" }) => {
  const { theme } = useTheme();
  const { textColor } = getColors(theme);
  
  return (
    <Text 
      style={[size, { color: textColor }]}
      className={className}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};
