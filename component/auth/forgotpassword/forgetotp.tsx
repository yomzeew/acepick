import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import OtpComponent from "../../controls/otpcomponent";
import { useEffect, useState } from "react";
import ButtonFunction from "../../buttonfunction";
import SliderModal from "../../SlideUpModal";
import AuthComponent from "../Authcontainer";
import { Textstyles } from "../../../static/textFontsize";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { ErrorAlertModal } from "component/errorAlertModal";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "services/authServices";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import ButtonComponent from "component/buttoncomponent";
import { useDelay } from "hooks/useDelay";

function ForgetOtp() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();
  const [showmodal, setshowmodal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  // Get phone number from Redux
  const email = useSelector((state: RootState) => state.register.userData?.email ?? "");
 

  // Countdown timer logic
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [otpEmail, setOtpEmail] = useState('')


  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage])


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [successMessage])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown]);

   useDelay(() => {
      if (shouldProceed) {
        setshowmodal(true)
      }
    }, 2000, [shouldProceed]);
  

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if(data.status){
        setShouldProceed(true)
      }
      else{
        setErrorMessage(data.message);
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
  const mutationResend = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      setSuccessMessage('OTP send to both Phone Number and Email')
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

  const handleResend = () => {
    setCountdown(600);
    setCanResend(false);
    if (!email ) {
      setErrorMessage('Enter email or phone number');
      return;
    }
    const payload = { email};
    mutationResend.mutate(payload, {
      onSuccess: (data) => {
        console.log(data)
        setSuccessMessage("OTP sent to both Phone Number and Email");
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || error?.message || "An unexpected error occurred";
        setErrorMessage(msg);
      },
    });
  };
  
  const submitFn = () => {
    console.log(otpEmail)
    if (!otpEmail) {
      setErrorMessage('Enter OTP for email or phone number')
      return
    }
   
    const payload = {
      "emailCode": {
        "email": email,
        "code": otpEmail
      }
    }
    mutation.mutate(payload)

  }

  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}
      <View style={{ backgroundColor }} className="w-full h-full">
        {showmodal && (
          <SliderModal
            setshowmodal={setshowmodal}
            showmodal={showmodal}
            route="/createnewpasswordscreen"
            title="Email Verified"
          />
        )}

        <AuthComponent title="Email Verification">
          <View className="p-6">
            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]} className="mb-4">
              Enter the verification code we just sent to your email
            </Text>

            <OtpComponent
              onOtpComplete={(value: string) => setOtpEmail(value)}
              textcolor={secondaryTextColor}
              text={canResend ? "" : `Resend in ${countdown}s`}
            />
            <View className="h-6" />
            {canResend && (
              <Pressable onPress={handleResend}>
                <Text style={[Textstyles.text_xsma, { color: primaryColor }]} className="mt-2">
                  Resend OTP
                </Text>
              </Pressable>
            )}
          </View>
        </AuthComponent>

        <View className="absolute bottom-10 w-full px-5">
          <View className="items-center w-full">
            <ButtonComponent
              color={primaryColor}
              text="Verify "
              textcolor="#fff"
              onPress={submitFn}
              isLoading={mutation.isPending}
              disabled={!otpEmail}
            />
            <View className="h-5" />
          </View>
        </View>

        <StatusBar style={theme === "dark" ? "light" : "dark"} />
      </View>
    </>

  );
}

export default ForgetOtp;
