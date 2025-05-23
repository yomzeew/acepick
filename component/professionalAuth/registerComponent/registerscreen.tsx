import { View, Text, TouchableOpacity, TextInput, Pressable } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import InputComponent from "../../controls/textinput";
import { useState } from "react";
import ButtonComponent from "../../buttoncomponent";
import AuthComponent from "../Authcontainer";
import { useLocalSearchParams } from "expo-router";

function RegisterScreenProfession() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const [isSecure, setIsSecure] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false); 

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };
  const { type } = useLocalSearchParams();


  return (
    <>
    <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
    <AuthComponent title={`Register as a ${type}`}>   
       <View className="items-center">
        <View className="h-3"></View>
        <InputComponent color={primaryColor} placeholder="Email" placeholdercolor={secondaryTextColor}/>
        <View className="h-3"></View>
        <InputComponent color={primaryColor} placeholder="Phone Number" placeholdercolor={secondaryTextColor}/>
      </View>

      
    </AuthComponent>
    <View className="absolute  bottom-6 w-full">
        <ButtonComponent
          color={primaryColor}
          text="Verify Email"
          textcolor="#fff" 
          route={`/verificationcode?type=${type}`}
        />
        <View className="h-5"></View>
      </View>
    </View>
  </> 
  );
}

export default RegisterScreenProfession;
