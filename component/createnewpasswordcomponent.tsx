import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import PasswordComponent from "./controls/passwordinput";
import BackComponent from "./backcomponent";
import ButtonComponent from "./buttoncomponent";
import { useState } from "react";
import EmptyView from "./emptyview";
import CenteredTextComponent from "./centeredtextcomponent";
function CreateNewPasswordcomponent() {
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
      <CenteredTextComponent textcolor={primaryTextColor} text="Create New Password" />
<View className="p-5">
<Text style={{color: subText}}>Enter a new password to login to your account.</Text> 
</View>
      <View className="items-center">
        <PasswordComponent
          color={primaryColor}
          placeholder="Enter Password"
          placeholdercolor={secondaryTextColor}
        />
        <View className="h-3"></View>
        <PasswordComponent
          color={primaryColor}
          placeholder="Confirm Password"
          placeholdercolor={secondaryTextColor}
        />
      </View>
      <View className="h-5"></View>
      <View className="">
        <ButtonComponent
          color={primaryColor}
          text="Reset Password"
          textcolor={backgroundColor}
          route="/passwordchangesuccessscreen"
        />
      </View>
    </View>
  );
}

export default CreateNewPasswordcomponent;
