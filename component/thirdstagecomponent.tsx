import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import BackComponent from "./backcomponent";
import ButtonComponent from "./buttoncomponent";
import InputComponent from "./textinput";
import EmptyView from "./emptyview";
import { AntDesign } from "@expo/vector-icons";
function ThirdStageComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <View className="h-10"></View>
      <View className="flex-1 justify-start items-center mt-4">
        {/* Title Section */}
        <Text className="text-xl font-bold mb-2" style={{ color: primaryTextColor }}>
          Register as a Client
        </Text>
        <Text className="text-lg text-center" style={{ color: "red" }}>
          Please ensure data provided are valid for verifications
        </Text>
<View className="h-5"></View>
       <View className="h-5"></View>
       <TouchableOpacity
          className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mb-4"
          style={{
            borderWidth: 2,
            borderColor: primaryColor,
          }}
        >
          <AntDesign name="camerao" size={36} color={primaryColor} />
        </TouchableOpacity>
        <Text className="text-lg" style={{ color: primaryColor }}>
          Upload Profile Photo
        </Text>
        <View className="h-5"></View>
        <View>
        <InputComponent color={primaryColor} placeholder="Full name"/>
        <View className="h-5"></View>
        <InputComponent color={primaryColor} placeholder="State of Residence"/>
        <View className="h-5"></View>
        <InputComponent color={primaryColor} placeholder="Local Govt of Residence"/>
        <View className="h-5"></View>
            <Text style={{color:primaryColor}} >Residential Address</Text>
            <View className="h-3"></View>
        <InputComponent color={primaryColor} placeholder="enter your full address"/>
        </View>
        {/* Button Section */}
        <View className="w-full mt-6">
          <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="" />
        </View>
      </View>
    </View>
  );
}

export default ThirdStageComponent;
