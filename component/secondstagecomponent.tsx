import { View, Text, TextInput, ScrollView } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { getColors } from "../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "./emptyview";
import { useRouter } from "expo-router";
import BackComponent from "./backcomponent";
import CenteredTextComponent from "./centeredtextcomponent";
import ButtonComponent from "./buttoncomponent";
import OtpComponent from "./otpcomponent";

function SecondStageComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <EmptyView />
      <CenteredTextComponent textcolor={primaryTextColor} text="Email & Phone Number Verification" />
      <View className="p-6">
      <View className="">
        <Text className="text-base mb-4 justify-center items-center w-full" style={{ color: secondaryTextColor }}>
          Enter the verification code we just sent to your email
        </Text>
        <View className="h-6"></View>
        <OtpComponent textcolor={secondaryTextColor} text=" Resend in 59s"/>
      </View>
      <View className="h-6"></View>
      <View className="">
        <Text className="text-base mb-4 justify-center items-center w-full" style={{ color: secondaryTextColor }}>
        Enter the verification code we just sent to your 081******394
        </Text>
        <View className="h-6"></View>
        <OtpComponent textcolor={secondaryTextColor} text=" Resend in 59s"/>
      </View>
      </View>
      <View className="absolute left-5 bottom-0 w-full">
        <ButtonComponent color={primaryColor} text="Verify" textcolor="#fff" route="/verificationsuccess"/>
       <View className="h-10"></View>
      </View>
      
    </View>
  );
}

export default SecondStageComponent;
