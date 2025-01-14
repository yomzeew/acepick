import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { useRouter } from "expo-router";
import ButtonComponent from "../../buttoncomponent";
import InputComponent from "../../controls/textinput";
import { AntDesign } from "@expo/vector-icons";
import AuthComponent from "../Authcontainer";
import { Textstyles } from "../../../static/textFontsize";


function ThirdStageComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  return (
    <>
    <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
    <AuthComponent title="Register as a Client">  
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ width: "100%", alignItems: "center" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            <View className="w-full items-center">
             
              <Text className="text-center" style={[Textstyles.text_xsmall,{ color: "red" }]}>
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
              placeholder="First Name"
              placeholdercolor={secondaryTextColor}
            />
            <View className="h-5"></View>
            <InputComponent
              color={primaryColor}
              placeholder="Last Name"
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
            <View className="w-full px-6 pb-3">
            <Text className="" style={{ color: primaryColor }}>
              Residential Address
            </Text>
            </View>
           
            <InputComponent
              color={primaryColor}
              placeholder="Enter your full address"
              placeholdercolor={secondaryTextColor}
            />

            </View>
        </ScrollView>
      </KeyboardAvoidingView>
        
    </AuthComponent>
    <View className="absolute bottom-0 w-full px-6">
        <View className="items-center w-full">
        <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="/passwordconfirmscreen" />
        <View className="h-10"></View>

        </View>
       
      </View>
    </View>
    </>
    
  );
}

export default ThirdStageComponent;
