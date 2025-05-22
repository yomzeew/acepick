import { View, TextInput, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";

const PasswordComponent = ({color, placeholder, placeholdercolor,value,onChange}: { color: string; placeholder: string; placeholdercolor:string;value:string,onChange:(text:string)=>void }) => {
  const [isSecure, setIsSecure] = useState(true);
   const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, backgroundColor } = getColors(theme); 

  return (
    <View
      style={{ borderColor: color }}
      className="w-full h-16 border rounded-lg flex-row items-center px-4"
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholdercolor}
        secureTextEntry={isSecure}
        className="text-base"
        onChangeText={(text:string)=>onChange(text)}
        value={value}
        style={{ flex: 1, color: secondaryTextColor }}
      />
      <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
        <AntDesign
          name={isSecure ? "eyeo" : "eye"}
          size={24}
          color="#B0B0B0"
        />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordComponent;
