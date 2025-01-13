import { View, TextInput, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";

const PasswordComponent = ({color, placeholder, placeholdercolor}: { color: string; placeholder: string; placeholdercolor:string }) => {
  const [isSecure, setIsSecure] = useState(true); 

  return (
    <View
      style={{ borderColor: color }}
      className="w-11/12 h-16 border rounded-lg flex-row items-center px-4"
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholdercolor}
        secureTextEntry={isSecure}
        style={{ flex: 1 }}
        className="text-base"
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
