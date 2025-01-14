import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../emptyview";
import { useRouter } from "expo-router";
import BackComponent from "../backcomponent";
import CenteredTextComponent from "../centeredtextcomponent";
import { ReactNode } from "react";

// ✅ Corrected Type Definition
interface AuthContainerProps{
  children: ReactNode;
  title:string
};

const AuthComponent = ({ children,title }: AuthContainerProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <EmptyView height={46} />
      <CenteredTextComponent textcolor={primaryTextColor} text={title} />

      {/* 🔹 Children Components (e.g., Inputs) */}
      {children}

      {/* 🔹 Bottom Section with Login and Register */}
      
    </View>
  );
};

export default AuthComponent;
