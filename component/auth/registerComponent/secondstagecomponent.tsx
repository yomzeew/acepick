import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import OtpComponent from "../../controls/otpcomponent";
import { useEffect, useState, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

function SecondStageComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();
  const [showmodal, setshowmodal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  // Get phone number from Redux
  const phone = useSelector((state: RootState) => state?.register.userData?.phone ?? "");
  const email = useSelector((state: RootState) => state?.register.userData?.email ?? "");
 

  const masked = phone.length >= 6 ? phone.slice(0, 3) + "******" + phone.slice(-3) : phone.replace(/.(?=.{3})/g, "*");

  // Countdown timer logic
  const RESEND_TIMER = 30;
  const [countdown, setCountdown] = useState(RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const [otpEmail, setOtpEmail] = useState('')
  const [otpphone, setOtpphone] = useState('')
  const endTimeRef = useRef<number>(Date.now() + RESEND_TIMER * 1000);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage])


  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage])

  // Date-based timer that survives background/screen off with improved persistence
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        // Try to restore timer from storage if available
        const storedEndTime = await AsyncStorage.getItem('otpTimerEnd');
        if (storedEndTime) {
          const endTime = parseInt(storedEndTime, 10);
          if (endTime > Date.now()) {
            endTimeRef.current = endTime;
          } else {
            // Timer expired, clear storage
            await AsyncStorage.removeItem('otpTimerEnd');
            endTimeRef.current = Date.now() + RESEND_TIMER * 1000;
          }
        }
      } catch (error) {
        console.error('Error initializing timer:', error);
      }
    };

    initializeTimer();

    const tick = async () => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setCountdown(remaining);
      
      // Store timer end time in storage for persistence
      try {
        if (remaining > 0) {
          await AsyncStorage.setItem('otpTimerEnd', endTimeRef.current.toString());
        } else {
          await AsyncStorage.removeItem('otpTimerEnd');
          setCanResend(true);
        }
      } catch (error) {
        console.error('Error storing timer:', error);
      }
    };

    const interval = setInterval(tick, 1000);
    tick();

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        // When app becomes active, reinitialize and tick immediately
        initializeTimer();
        tick();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

   useDelay(() => {
      if (shouldProceed) {
        setshowmodal(true)
      }
    }, 2000, [shouldProceed]);
  

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if(data?.success){
        setShouldProceed(true)
      }
      else{
        setErrorMessage(data.message || "Verification failed");
      }
      
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      setErrorMessage(msg);
      console.error("Login failed:", msg);
    },
  });
  const mutationResend = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      setSuccessMessage('OTP send to both Phone Number and Email')
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      setErrorMessage(msg);
      console.error("Login failed:", msg);
    },
  });

  const handleResend = () => {
    endTimeRef.current = Date.now() + RESEND_TIMER * 1000;
    setCountdown(RESEND_TIMER);
    setCanResend(false);
    if (!email || !phone) {
      setErrorMessage('Enter email or phone number');
      return;
    }
    const payload = { email, phone };
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
    console.log(otpEmail,otpphone)
    if (!otpphone || !otpEmail) {
      setErrorMessage('Enter OTP for email or phone number')
      return
    }
   
    const payload = {
      "emailCode": {
        "email": email,
        "code": otpEmail
      }, "smsCode": {
        "phone": phone,
        "code": otpphone
      }
    } as any
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
            route="/clientregistrationscreen"
            title="Email/Phone Number Verified"
          />
        )}

        <AuthComponent title="Email/Phone Number Verification">
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

            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]} className="mb-4">
              Enter the verification code we just sent to your {masked}
            </Text>

            <OtpComponent
              onOtpComplete={(value: string) => setOtpphone(value)}
              textcolor={secondaryTextColor}
              text={canResend ? "" : `Resend in ${countdown}s`}
            />

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
              text="Verify Now"
              textcolor="#fff"
              onPress={submitFn}
              isLoading={mutation.isPending}
              disabled={!otpphone || !otpEmail || mutation.isPending}
            />
            <View className="h-5" />
            
            {/* Additional feedback for verification state */}
            {mutation.isPending && (
              <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]} className="text-center">
                Verifying your codes...
              </Text>
            )}
            {shouldProceed && !mutation.isPending && (
              <Text style={[Textstyles.text_xsma, { color: 'green' }]} className="text-center">
                ✓ Verification successful!
              </Text>
            )}
          </View>
        </View>

        <StatusBar style={theme === "dark" ? "light" : "dark"} />
      </View>
    </>

  );
}

export default SecondStageComponent;
