import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import BackComponent from "./backcomponent";
import ButtonComponent from "./buttoncomponent";
import InputComponent from "./textinput";
import EmptyView from "./emptyview";
import { AntDesign } from "@expo/vector-icons";
import CenteredTextComponent from "./centeredtextcomponent";
function ThirdStageComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <View className="flex-1 items-center mt-4">
        <ScrollView
          contentContainerStyle={{ width: "100%", alignItems: "center" }}
          showsVerticalScrollIndicator={false}
        >
         <EmptyView />
         <CenteredTextComponent textcolor={primaryTextColor} text="Register as a Client" />
          <Text
            className="text-lg text-center"
            style={{ color: "red" }}
          >
            Please ensure data provided are valid for verifications
          </Text>
          <View className="h-5"></View>

          {/* Upload Profile Picture Section */}
          <TouchableOpacity
            className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mb-4 self-center"
            style={{
              borderWidth: 2,
              borderColor: primaryColor,
            }}
          >
            <AntDesign name="camerao" size={36} color={primaryColor} />
          </TouchableOpacity>
          <Text className="text-lg text-center" style={{ color: primaryColor }}>
            Upload Profile Photo
          </Text>
          <View className="h-5"></View>

          {/* Input Fields */}
          <InputComponent
            color={primaryColor}
            placeholder="Full name"
            placeholdercolor={secondaryTextColor}
          />
          <View className="h-5"></View>
          <InputComponent
            color={primaryColor}
            placeholder="State of Residence"
            placeholdercolor={secondaryTextColor}
          />
          <View className="h-5"></View>
          <InputComponent
            color={primaryColor}
            placeholder="Local Govt of Residence"
            placeholdercolor={secondaryTextColor}
          />
          <View className="h-5"></View>
          <Text className="self-start" style={{ color: primaryColor }}>
            Residential Address
          </Text>
          <InputComponent
            color={primaryColor}
            placeholder="enter your full address"
            placeholdercolor={secondaryTextColor}
          />
        </ScrollView>
        <View className="h-5"></View>
        <View className="w-full">
          <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="/passwordconfirmscreen" />
        </View>
      </View>
    </View>
  );
}

export default ThirdStageComponent;
