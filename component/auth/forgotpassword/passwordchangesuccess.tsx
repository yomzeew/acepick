import { View, Text } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../../emptyview";
import ButtonComponent from "../../buttoncomponent";
import VerifyComponent from "../../verifycomponent";
function PasswordChangeSuccessComponent() {
  const { theme } = useTheme(); 
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor, subText } = getColors(theme);
  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full justify-center items-center p-6">
      <StatusBar style="auto" />
      <VerifyComponent textcolor={secondaryTextColor} text="Password Changed!"/>
      <Text style={{color: subText}}>Your Password has been changed successfully</Text>
      <EmptyView/>
<ButtonComponent color={primaryColor} text="Back to login" textcolor={backgroundColor} route="/loginscreen"/>
    </View>
  );
}

export default PasswordChangeSuccessComponent;
