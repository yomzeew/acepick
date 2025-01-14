import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ButtonFunction = ({ color, text, textcolor, onPress }: { color: string; text: string; textcolor: string; onPress:()=>void }) => {
  const router = useRouter()
  return (
    <View className="w-full justify-center items-center">
      <TouchableOpacity
        style={{ backgroundColor: color }}
        className="w-11/12 h-14 rounded-lg justify-center items-center"
        onPress={onPress}
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

export default ButtonFunction;
