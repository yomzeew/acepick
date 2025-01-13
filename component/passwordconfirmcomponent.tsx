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
function PasswordConfirmcomponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
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
      <CenteredTextComponent textcolor={primaryTextColor} text="Register as a Client" />

      <View className="mt-6 items-center">
        <PasswordComponent
          color={primaryColor}
          placeholder="Create Password"
          placeholdercolor={secondaryTextColor}
        />
        <View className="h-3"></View>
        <PasswordComponent
          color={primaryColor}
          placeholder="Confirm Password"
          placeholdercolor={secondaryTextColor}
        />
      </View>

 
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={toggleCheckbox}
          className="w-5 h-5 border justify-center items-center rounded-sm"
          style={{ borderColor: primaryColor }}
        >
          {isChecked && (
            <View style={{ width: 12, height: 12, backgroundColor: primaryColor }} />
          )}
        </TouchableOpacity>
        <Text style={{ color: primaryTextColor }} className="text-base ml-2">
          I agree to <Text style={{ color: primaryColor }}>Terms and Conditions</Text>
        </Text>
      </View>
      <View className="absolute left-5 bottom-6 w-full">
        <ButtonComponent
          color={primaryColor}
          text="Register"
          textcolor={backgroundColor}
          route="/accountsuccessscreen"
        />
      </View>
    </View>
  );
}

export default PasswordConfirmcomponent;
