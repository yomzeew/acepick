import { View, Text, Pressable } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OtpComponent from "component/controls/otpcomponent";
import ButtonComponent from "component/buttoncomponent";
import { Textstyles } from "static/textFontsize";
import { useSelector } from "react-redux";
import type { RootState } from "redux/store";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "services/authServices";
import { useDelay } from "hooks/useDelay";
import { useToast } from "context/ToastContext";

interface OtpVerificationStepProps {
  onNext: () => void;
}

const OtpVerificationStep = ({ onNext }: OtpVerificationStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme);

  const toast = useToast();
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  const phone = useSelector((state: RootState) => state?.auth?.registrationData?.phone ?? "");
  const email = useSelector((state: RootState) => state?.auth?.registrationData?.email ?? "");

  const masked = phone.length >= 6
    ? phone.slice(0, 3) + "******" + phone.slice(-3)
    : phone.replace(/.(?=.{3})/g, "*");

  const RESEND_TIMER = 30;
  const [countdown, setCountdown] = useState(RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const endTimeRef = useRef<number>(Date.now() + RESEND_TIMER * 1000);

  // Date-based countdown timer
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const storedEndTime = await AsyncStorage.getItem('otpTimerEnd');
        if (storedEndTime) {
          const endTime = parseInt(storedEndTime, 10);
          if (endTime > Date.now()) {
            endTimeRef.current = endTime;
          } else {
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
      onNext();
    }
  }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data?.status || data?.success) {
        const { emailVerified, smsVerified, emailError, smsError } = data.data || {};
        if (emailVerified) {
          toast.success('Verified', 'Email verified successfully');
        }
        setShouldProceed(true);
      } else {
        toast.error('Failed', data.message || 'Verification failed');
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
      toast.error('Error', msg);
    },
  });

  const mutationResend = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      const emailSendStatus = data.data?.emailSendStatus;
      const smsSendStatus = data.data?.smsSendStatus;
      if (emailSendStatus) {
        toast.success('OTP Resent', smsSendStatus ? 'OTP sent to both Phone Number and Email' : 'OTP sent to Email');
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
      toast.error('Error', msg);
    },
  });

  const handleResend = () => {
    endTimeRef.current = Date.now() + RESEND_TIMER * 1000;
    setCountdown(RESEND_TIMER);
    setCanResend(false);
    if (!email || !phone) {
      toast.error('Missing Info', 'Enter email or phone number');
      return;
    }
    mutationResend.mutate({ email, type: "EMAIL", reason: "verification" });
  };

  const submitFn = () => {
    if (!otpEmail) {
      toast.error('Missing OTP', 'Enter the email OTP code');
      return;
    }

    const payload = {
      emailCode: { email, code: otpEmail },
    };

    mutation.mutate(payload);
  };

  return (
    <>
      <View className="flex-1 w-full px-2">
        <View className="p-4">
          <Text style={[Textstyles.text_xsma, { color: secondaryTextColor }]} className="mb-4">
            Enter the verification code we just sent to your email
          </Text>

          <OtpComponent
            onOtpComplete={(value: string) => setOtpEmail(value)}
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
      </View>

      <View className="w-full px-5 pb-6">
        <ButtonComponent
          color={primaryColor}
          text="Verify Now"
          textcolor="#fff"
          onPress={submitFn}
          isLoading={mutation.isPending}
          disabled={!otpEmail || mutation.isPending}
        />
      </View>
    </>
  );
};

export default OtpVerificationStep;
