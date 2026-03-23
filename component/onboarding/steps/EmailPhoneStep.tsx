import { View, Text } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState } from "react";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import { ThemeText } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import { normalizePhone } from "utilizes/phoneNumberNormalize";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";
import { useDelay } from "hooks/useDelay";
import { useToast } from "context/ToastContext";

interface EmailPhoneStepProps {
  onNext: () => void;
  roleLabel: string;
}

const EmailPhoneStep = ({ onNext, roleLabel }: EmailPhoneStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, secondaryTextColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const dispatch = useDispatch();

  const validatePhone = (phone: string): string | null => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone) return "Phone number is required";
    if (phone !== cleanPhone) return "Phone number should contain only numbers and +";
    const phoneRegex = /^\+234[0-9]{10}$/;
    const normalizedPhone = normalizePhone(cleanPhone);
    if (!phoneRegex.test(normalizedPhone)) {
      return "Please enter a valid Nigerian phone number (+234 followed by 10 digits)";
    }
    return null;
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setPhoneError(validatePhone(value));
  };

  useDelay(() => {
    if (shouldProceed) {
      dispatch(setRegistrationData({ email, phone: normalizePhone(phone) }));
      onNext();
    }
  }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      const emailSendStatus = data.data.emailSendStatus;
      const smsSendStatus = data.data.smsSendStatus;
      if (emailSendStatus) {
        toast.success('OTP Sent', 'OTP sent to your Email');
        setShouldProceed(true);
      } else {
        toast.error('Verification Failed', 'Please enter a valid email address or Phone Number');
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'An unexpected error occurred';
      toast.error('Error', msg);
    },
  });

  const handleNext = () => {
    if (!email || !phone) {
      toast.error('Missing Fields', 'Please fill both fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }
    const phoneValidationError = validatePhone(phone);
    if (phoneValidationError) {
      toast.error('Invalid Phone', phoneValidationError);
      return;
    }
    const phoneformat = normalizePhone(phone);
    const payload = { email, phone: phoneformat, type: "EMAIL", reason: "verification" };
    mutation.mutate(payload);
  };

  return (
    <>
      <View className="flex-1 w-full items-center px-2">
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
          <ThemeText size={Textstyles.text_xxxsmall}>hint: +23481xxxxxxxxx</ThemeText>
        </View>
        <InputComponent
          color={primaryColor}
          placeholder="Phone Number"
          placeholdercolor={secondaryTextColor}
          value={phone}
          onChange={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={14}
        />
        {phoneError && (
          <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="mt-1 w-full">
            {phoneError}
          </Text>
        )}
      </View>

      <View className="w-full px-5 pb-6">
        <ButtonComponent
          color={primaryColor}
          text="Verify Email & Phone Number"
          textcolor="#fff"
          onPress={handleNext}
          isLoading={mutation.isPending}
          disabled={!email || !phone || !!phoneError}
        />
      </View>
    </>
  );
};

export default EmailPhoneStep;
