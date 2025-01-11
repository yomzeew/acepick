import { View, Text, TextInput } from "react-native";
import React from "react";

const OtpComponent = ({ textcolor, text}: {textcolor: string; text:string;}) => {
  return (
    <View className="w-full">
      <View className="flex-row justify-between">
        {Array(4)
          .fill("")
          .map((_, index) => (
            <TextInput
              key={index}
              className="w-14 h-12 border border-otpYellow  text-center text-lg rounded-md"
              style={{ color: textcolor }}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
      </View>

      <Text className="mt-3 text-sm" style={{ color: textcolor }}>
        {text}
      </Text>
    </View>
  );
};

export default OtpComponent;
