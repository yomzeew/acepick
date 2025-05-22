import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store"
import { useDebounce } from "../../../hooks/useDebounce";
import PasswordComponent from "../../controls/passwordinput";
import ButtonComponent from "../../buttoncomponent";
import AuthComponent from "../Authcontainer";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import SliderModal from "component/SlideUpModal";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "services/authServices";
import { useDelay } from "hooks/useDelay";
import { useRole } from "context/roleContext";

function PasswordConfirmcomponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

  const registerData = useSelector((state: RootState) => state.register.userData);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showmodal, setshowmodal] = useState(false);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

  const { state } = useRole();
  const role=state.role
  console.log(role)

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

  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);

  useEffect(() => {
    if (debouncedConfirmPassword.length > 0 && password !== debouncedConfirmPassword) {
      setErrorMessage("Passwords do not match");
    } else {
      setErrorMessage(null);
    }
  }, [debouncedConfirmPassword, password]);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };
useDelay(() => {
    if (shouldProceed) {
     setshowmodal(true)
    }
  }, 2000, [shouldProceed]);


  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
    console.log(data)
      setSuccessMessage('Registration Successful')
      setShouldProceed(true)

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
  const handleRegister = () => {
    console.log('ok')
    if (!isChecked) {
      setErrorMessage("You must agree to the Terms and Conditions");
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Proceed with registerData + password
    console.log("Final Registration Payload: ", { ...registerData, password,confirmPassword,role,agreed:isChecked });
    const payload={ ...registerData, password,confirmPassword,role,agreed:isChecked }
    mutation.mutate(payload)
  };

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}
      {showmodal && 
      <SliderModal
      setshowmodal={setshowmodal}
      showmodal={showmodal}
      route="/loginscreen"
      title={`Your account has been created \n successfully`}
      />}

      <View style={{ backgroundColor }} className="w-full h-full">
        <AuthComponent title="Register as a Client">
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
              onPress={toggleCheckbox}
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
        </AuthComponent>

        <View className="absolute bottom-0 w-full px-6">
          <View className="items-center w-full">
            <ButtonComponent
              color={primaryColor}
              text="Register"
              textcolor="#fff"
              onPress={handleRegister}
              isLoading={mutation.isPending}
              disabled={!password || !confirmPassword}
            />
            <View className="h-10" />
          </View>
        </View>
      </View>
    </>
  );
}

export default PasswordConfirmcomponent;
