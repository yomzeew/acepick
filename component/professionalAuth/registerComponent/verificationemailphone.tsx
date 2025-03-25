import { View, Text} from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../../emptyview";
import { useRouter } from "expo-router";
import OtpComponent from "component/controls/otpcomponent";
import { useState } from "react";
import ButtonFunction from "../../buttonfunction";
import SliderModal from "../../SlideUpModal";
import AuthComponent from "../Authcontainer";
import { Textstyles } from "../../../static/textFontsize";

function EmailPhoneNumberVerification() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();
  const [showmodal,setshowmodal]=useState<boolean>(false)
  return (
    <>
    <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
    {showmodal && 
      <SliderModal
      setshowmodal={setshowmodal}
      showmodal={showmodal}
      route="/clientregistrationscreen"
      title="Email/Phone number Verified"
      />}
    <AuthComponent title="Email/Phone Number Verification">  
    <View className="p-6">
      <View className="">

        <Text className="text-base mb-4 justify-center items-center w-full" style={[Textstyles.text_xsma,{ color: secondaryTextColor }]}>
          Enter the verification code we just sent to your email
        </Text>
        <View className="h-6"></View>
        <OtpComponent onOtpComplete={()=>console.log("ok")}  textcolor={secondaryTextColor} text=" Resend in 59s"/>
      </View>
      <View className="h-6"></View>
      <View className="">
        <Text className="text-base mb-4 justify-center items-center w-full" style={[Textstyles.text_xsma,{ color: secondaryTextColor }]}>
        Enter the verification code we just sent to your 081******394
        </Text>
        <View className="h-6"></View>
        <OtpComponent onOtpComplete={()=>console.log("ok")} textcolor={secondaryTextColor} text=" Resend in 59s"/>
      </View>
      </View>       
    </AuthComponent>
    <View className="absolute bottom-0 w-full px-6">
        <View className="items-center w-full">
        <ButtonFunction color={primaryColor} text="Verify" textcolor="#fff" onPress={()=>setshowmodal(!showmodal)}/>
        <View className="h-10"></View>

        </View>
       
      </View>
   </View>
    </>
  );
}

export default EmailPhoneNumberVerification;
