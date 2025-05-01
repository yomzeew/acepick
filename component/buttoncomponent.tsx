import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ButtonComponent = ({ color, text, textcolor, route }: { color: string; text: string; textcolor: string; route:string }) => {
  const router = useRouter()
  return (
    <View className="w-full justify-center items-center">
      <TouchableOpacity
        style={{ backgroundColor: color }}
        className="w-full h-14 rounded-lg justify-center items-center"
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
