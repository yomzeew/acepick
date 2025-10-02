import { View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../../emptyview";
import ButtonComponent from "../../buttoncomponent";
import VerifyComponent from "../../verifycomponent";
function AccountSuccessScreen() {
  const { theme } = useTheme(); 
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full justify-center items-center p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <VerifyComponent textcolor={secondaryTextColor} text="Your account has been created successfully"/>
<ButtonComponent color={primaryColor} text="Login now" textcolor={backgroundColor} route="/loginscreen" onPress={function (): void {
        throw new Error("Function not implemented.");
      } }/>
    </View>
  );
}

export default AccountSuccessScreen;
