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
import OtpComponent from "./otpcomponent";
function ForgetOtp() {
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
      <CenteredTextComponent textcolor={primaryTextColor} text="Otp Verification" />
      <View className="p-6">
<Text style={{color: subText}}>Please enter the verification code we just sent on your email address.</Text>
<View className="h-5"></View>
      <OtpComponent textcolor={secondaryTextColor} text=""/>
</View>
      <View className="">
        <ButtonComponent
          color={primaryColor}
          text="Verify"
          textcolor={backgroundColor}
          route="/createnewpasswordscreen"
        />
      </View>
    </View>
  );
}

export default ForgetOtp;
