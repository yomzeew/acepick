import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const ButtonComponent = ({ color, text, textcolor, route }: { color: string; text: string; textcolor: string; route:string }) => {
  const router = useRouter()
  return (
    <View className="w-full justify-center items-center">
      <TouchableOpacity
        style={{ backgroundColor: color }}
        className="w-11/12 rounded-lg justify-center items-center py-3"
        onPress={()=>router.navigate(route)}
      >
        <Text
          style={{ color: textcolor }}
          className="text-lg font-bold"
        >
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonComponent;
