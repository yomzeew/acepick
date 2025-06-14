import { View, Text, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
import React, { useRef, useState } from "react";

const OtpComponent = ({
  textcolor,
  text,
  onOtpComplete,
}: {
  textcolor: string;
  text: string;
  onOtpComplete: (otp: string) => void;
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));

  // Handle input change
  const handleChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (index < inputs.current.length - 1) {
        inputs.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }

      // If all 6 digits are filled, return OTP
      const otpString = newOtp.join("");
      if (!newOtp.includes("")) {
        onOtpComplete(otpString);
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full items-center">
        <View className="flex-row gap-x-2">
          {Array(4)
            .fill("")
            .map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                className="w-10 h-12 border border-slate-500 text-center text-lg rounded-md text-white"
                style={{ color: textcolor }}
                keyboardType="numeric"
                maxLength={1}
                value={otp[index]}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                returnKeyType={index === 5 ? "done" : "next"}
                blurOnSubmit={index === 5}
              />
            ))}
        </View>

        <Text className="text-sm mt-2" style={{ color: textcolor }}>
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpComponent;
