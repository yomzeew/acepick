import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StatusBar } from "expo-status-bar";
import EmptyView from "./emptyview";
import InputComponent from "./textinput";
import { useState } from "react";
import PasswordComponent from "./passwordinput";
import BackComponent from "./backcomponent";
import { router } from "expo-router";
import CenteredTextComponent from "./centeredtextcomponent";
import ButtonComponent from "./buttoncomponent";

function FirstStagecomponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const [isSecure, setIsSecure] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false); 

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor}/>
      <EmptyView />
      <CenteredTextComponent textcolor={primaryTextColor} text=" Register as a Client"/>
      <View className="h-10"></View>

      <View className="items-center">
        <View className="h-5"></View>
        <InputComponent color={primaryColor} placeholder="Email" />
        <View className="h-5"></View>
        <InputComponent color={primaryColor} placeholder="Phone Number" />
        <View className="h-5"></View>
        <PasswordComponent color={primaryColor} placeholder="Create Password"  />
        <View className="h-5"></View>
        <PasswordComponent color={primaryColor} placeholder="Confirm Password" />
      </View>
  
      <View className="flex-row items-center p-5 w-full
      ">
        <TouchableOpacity onPress={toggleCheckbox} className="w-5 h-5 border justify-center items-center rounded-sm" style={{  borderColor: primaryColor}}>
          {isChecked && (
            <View style={{ width: 12, height: 12, backgroundColor: primaryColor }} />
          )}
        </TouchableOpacity>
        <Text style={{ color: primaryTextColor }} className="text-base ml-2">
          I agree to the <Text style={{ color: primaryColor }}>terms and conditions</Text>
        </Text>
      </View>

      <View className="h-5"></View>
      <View className="absolute w-full left-5 bottom-0">
        <ButtonComponent color={primaryColor} text="Verify email" textcolor="#fff" route="/emailverificationscreen"/>
        <View className="h-5"></View>
        <EmptyView />
      </View>
    </View>
  );
}

export default FirstStagecomponent;
