import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import PasswordComponent from "./passwordinput";
import BackComponent from "./backcomponent";
import ButtonComponent from "./buttoncomponent";
import { useState } from "react";
import EmptyView from "./emptyview";
import CenteredTextComponent from "./centeredtextcomponent";
import InputComponent from "./textinput";
function RecoverPassword() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor, subText } = getColors(theme);
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <EmptyView />
      <CenteredTextComponent textcolor={primaryTextColor} text="Recover Password" />
      <View className="p-6">
<Text style={{color: subText}}>Please enter the email associated with your account to reset your password.</Text>
</View>
      <View className="items-center">
        <InputComponent
          color={primaryColor}
          placeholder="Enter email"
          placeholdercolor={secondaryTextColor}
        />
       <View className="h-5"></View>
      </View>

      <View className="">
        <ButtonComponent
          color={primaryColor}
          text="Send code"
          textcolor={backgroundColor}
          route="/verifyotpscreen"
        />
      </View>
    </View>
  );
}

export default RecoverPassword;
