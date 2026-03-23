import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useDebounce } from "hooks/useDebounce";
import { useDelay } from "hooks/useDelay";
import PasswordComponent from "component/controls/passwordinput";
import ButtonComponent from "component/buttoncomponent";
import { useMutation } from "@tanstack/react-query";
import { registerUser, registerArtisan, registerCorporate, registerRider } from "services/authServices";
import { clearRegistrationData } from "redux/slices/authSlice";
import { useToast } from "context/ToastContext";
import { useRouter } from "expo-router";

type RoleType = 'client' | 'artisan' | 'corperate' | 'delivery';

interface PasswordStepProps {
  role: RoleType;
  onComplete: () => void;
}

const PasswordStep = ({ role, onComplete }: PasswordStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const toast = useToast();
  const router = useRouter();

  const registerData = useSelector((state: RootState) => state.auth.registrationData);
  const corporateData = useSelector((state: RootState) => state.auth.cooperationData);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [shouldProceed, setShouldProceed] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const dispatch = useDispatch();

  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);

  useEffect(() => {
    if (debouncedConfirmPassword.length > 0 && password !== debouncedConfirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [debouncedConfirmPassword, password]);

  useDelay(() => {
    if (shouldProceed) {
      dispatch(clearRegistrationData());
      router.replace('/loginscreen');
    }
  }, 2000, [shouldProceed]);

  // Select the correct register function based on role
  const getRegisterFn = () => {
    switch (role) {
      case 'client': return registerUser;
      case 'artisan': return registerArtisan;
      case 'corperate': return registerCorporate;
      case 'delivery': return registerRider;
      default: return registerUser;
    }
  };

  const mutation = useMutation({
    mutationFn: getRegisterFn(),
    onSuccess: () => {
      toast.success('Account Created', 'Your account has been created successfully!');
      setShouldProceed(true);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'An unexpected error occurred';
      toast.error('Registration Failed', msg);
    },
  });

  const handleRegister = () => {
    if (!isChecked) {
      toast.error('Terms Required', 'You must agree to the Terms and Conditions');
      return;
    }
    if (!password || !confirmPassword) {
      toast.error('Missing Fields', 'Please fill in both password fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mismatch', 'Passwords do not match');
      return;
    }
    if (!registerData?.firstName || !registerData?.lastName || !registerData?.email || !registerData?.phone) {
      toast.error('Incomplete', 'Please complete all required fields');
      return;
    }

    let payload: any;
    if (role === 'corperate') {
      payload = { ...registerData, password, confirmPassword, role, agreed: isChecked, cooperation: corporateData };
    } else {
      payload = { ...registerData, password, confirmPassword, role, agreed: isChecked };
    }

    mutation.mutate(payload);
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'client': return 'Client';
      case 'artisan': return 'Artisan';
      case 'corperate': return 'Corporate';
      case 'delivery': return 'Delivery Rider';
      default: return 'User';
    }
  };

  return (
    <>
      <View className="flex-1 w-full px-2">
        <View className="mt-6 items-center">
          <PasswordComponent
            color={primaryColor}
            placeholder="Create Password"
            placeholdercolor={secondaryTextColor}
            onChange={setPassword}
            value={password}
          />
          <View className="h-3" />
          <PasswordComponent
            color={primaryColor}
            placeholder="Confirm Password"
            placeholdercolor={secondaryTextColor}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
        </View>

        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => setIsChecked(!isChecked)}
            className="w-5 h-5 border justify-center items-center rounded-sm"
            style={{ borderColor: primaryColor }}
          >
            {isChecked && (
              <View style={{ width: 12, height: 12, backgroundColor: primaryColor }} />
            )}
          </TouchableOpacity>
          <Text style={{ color: primaryTextColor }} className="text-base ml-2">
            I agree to <Text style={{ color: primaryColor }}>Terms and Conditions</Text>
          </Text>
        </View>
      </View>

      <View className="w-full px-5 pb-6">
        <ButtonComponent
          color={primaryColor}
          text="Register"
          textcolor="#fff"
          onPress={handleRegister}
          isLoading={mutation.isPending}
          disabled={!password || !confirmPassword}
        />
      </View>
    </>
  );
};

export default PasswordStep;
