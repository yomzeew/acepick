import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ButtonFunction = ({ color, text, textcolor, onPress,style }: { color: string; text: string; textcolor: string; onPress:()=>void ,style?:string}) => {
  const router = useRouter()
  return (
    <View className="w-full justify-center items-center">
      <TouchableOpacity
        style={{ backgroundColor: color }}
        className="w-full h-14 rounded-lg justify-center items-center"
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
export const ButtonFunctionoutline=({ text, textcolor, onPress,style }: {  text: string; textcolor: string; onPress:()=>void ,style?:any})=>{
  return (
    <View className="w-full justify-center items-center">
    <TouchableOpacity
      style={style}
      className="w-11/12 h-14 rounded-lg justify-center items-center "
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

  )
}
