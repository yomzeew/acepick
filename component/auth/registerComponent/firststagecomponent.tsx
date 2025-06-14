import { View,Text } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import InputComponent from "../../controls/textinput";
import { useEffect, useState } from "react";
import ButtonComponent from "../../buttoncomponent";
import AuthComponent from "../Authcontainer";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "../../../redux/registerSlice";
import { useRouter } from "expo-router"; // Assuming you're using expo-router
import { Textstyles } from "static/textFontsize";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import { ThemeText } from "component/ThemeText";
import { normalizePhone } from "utilizes/phoneNumberNormalize";
import { useDelay } from "hooks/useDelay";
import { AlertMessageBanner } from "component/AlertMessageBanner";

function FirstStagecomponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);


  const dispatch = useDispatch();
  const router = useRouter();
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage])
 

  useDelay(() => {
    if (shouldProceed) {
      dispatch(setRegistrationData({ email, phone }));
      router.push("/emailverificationscreen");
    }
  }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
    console.log(data)
    const emailSendStatus=data.data.emailSendStatus
    const smsSendStatus=data.data.smsSendStatus
    if(emailSendStatus  && smsSendStatus){
      setSuccessMessage('OTP send to both Phone Number and Email')
      setShouldProceed(true)
    
    
    }
    else{
      setErrorMessage("Please enter a valid email address or Phone Number");
      setShouldProceed(false)

    }


    },
   onError: (error: any) => {
      let msg = "An unexpected error occurred";
    
      if (error?.response?.data) {
        // Try multiple common formats
        msg =
          error.response.data.message ||         // Common single message
          error.response.data.error ||           // Alternative key
          JSON.stringify(error.response.data);   // Fallback: dump full error object
      } else if (error?.message) {
        msg = error.message;
      }
    
      setErrorMessage(msg);
      console.error("Register failed:", msg);
    },
  });

  const handleNext = () => {
    if (!email || !phone) {
      setErrorMessage('Please fill both fields')
      return;
    }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+234[0-9]{10}$/; // Ensures +234 followed by 10 digits

  if (!emailRegex.test(email)) {
    setErrorMessage("Please enter a valid email address");
    return;
  }
 const phoneformat=normalizePhone(phone)
  if (!phoneRegex.test(phoneformat)) {
    setErrorMessage("Please enter a valid phone number");
    return;
  }
  const payload={email,phone,"type": "BOTH","reason": "verification",}
  mutation.mutate(payload) 
  };

  return (
    <>
   {successMessage && (
  <AlertMessageBanner type="success" message={successMessage} />
)}
{errorMessage && (
  <AlertMessageBanner type="error" message={errorMessage} />
)}
   
    <View style={{ backgroundColor }} className="w-full h-full">
      <AuthComponent title="Register as a Client">
        <View className="items-center">
          <View className="h-3" />
          <InputComponent
            color={primaryColor}
            placeholder="Email"
            placeholdercolor={secondaryTextColor}
            value={email}
            onChange={setEmail}
          />
          <View className="h-3" />
          <View className="w-full items-start">
          <ThemeText size={Textstyles.text_xxxsmall}>
            hint:+23481xxxxxxxxx
          </ThemeText>

          </View>
          
          <InputComponent
            color={primaryColor}
            placeholder="Phone Number"
            placeholdercolor={secondaryTextColor}
            value={phone}
            onChange={setPhone}
          />
        </View>
      </AuthComponent>

      <View className="absolute bottom-10 w-full px-5">
      <ButtonComponent
  color={primaryColor}
  text="Verify Email & Phone Number"
  textcolor="#fff"
  onPress={handleNext}
  isLoading={mutation.isPending}
  disabled={!email || !phone}
/>

        <View className="h-5" />
      </View>
    </View>
    </>
  );
}

export default FirstStagecomponent;
