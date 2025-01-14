import { View, Text, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
import React, { useRef } from "react";

const OtpComponent = ({ textcolor, text }: { textcolor: string; text: string }) => {
  // Create refs for each input
  const inputs = useRef<Array<TextInput | null>>([]);

  // Handle input change
  const handleChange = (value: string, index: number) => {
    if (value.length === 1) {
      if (index < inputs.current.length - 1) {
        inputs.current[index + 1]?.focus(); // Move to next input
      } else {
        Keyboard.dismiss(); // Dismiss keyboard on the last input
      }
    }
  };

  // Handle backspace to move to the previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      if (!e.nativeEvent.text) {
        inputs.current[index - 1]?.focus(); // Move to previous input
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full">
        <View className="flex-row justify-between">
          {Array(4)
            .fill("")
            .map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                className="w-14 h-12 border border-otpYellow text-center text-lg rounded-md text-white"
                style={{ color: textcolor }}
                keyboardType="numeric"
                maxLength={1}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                returnKeyType={index === 3 ? "done" : "next"} // "Done" for the last input
                blurOnSubmit={index === 3} // Dismiss keyboard on "Done"
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
