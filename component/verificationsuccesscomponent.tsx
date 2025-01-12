import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "./emptyview";
import ButtonComponent from "./buttoncomponent";
import VerifyComponent from "./verifycomponent";
function EmailVerificationScreen() {
  const { theme } = useTheme(); 
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full justify-center items-center p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <VerifyComponent textcolor={secondaryTextColor} text="Email & Phone number Verified!"/>
<ButtonComponent color={primaryColor} text="Continue registration" textcolor={backgroundColor} route="/clientregistrationscreen"/>
    </View>
  );
}

export default EmailVerificationScreen;
