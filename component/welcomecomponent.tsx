import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AcePick from "../assets/acepick.svg"; 
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color"; 
import EmptyView from "./emptyview";
import { useRouter } from "expo-router";
import { Textstyles } from "../static/textFontsize";
function WelcomeComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, welcomeText } = getColors(theme);
const router = useRouter()
  return (
    <View
      style={{ backgroundColor: backgroundColor }}
      className="h-full w-full flex items-center justify-center p-8"
    >
      <View>
        <AcePick />
      </View>
      <EmptyView/>
      <View>
        
        <Text
          style={[Textstyles.text_medium,{ color:welcomeText }]}
          className="text-2xl font-bold text-center"
        >
          Who are you?
        </Text>
      </View>
      <EmptyView/>
      {/* Buttons */}
      <View className="w-full flex items-center">
        <TouchableOpacity onPress={()=>router.navigate("/loginscreen")}
          style={{ borderColor: primaryColor }}
          className="w-11/12 border rounded-lg py-4 mb-4"
        >
          <Text
            style={[Textstyles.text_cmedium,{ color: primaryColor }]}
            className="text-center text-lg font-semibold"
          >
            Client
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: primaryColor }}
          className="w-11/12 rounded-lg py-4"
        >
          <Text
            style={[Textstyles.text_cmedium,{ color: "#ffffff" }]}
            className="text-center text-lg font-semibold"
          >
            Professional
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default WelcomeComponent;
