import { View} from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import PasswordComponent from "../../controls/passwordinput";
import ButtonComponent from "../../buttoncomponent";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import SliderModal from "component/SlideUpModal";
import { useDebounce } from "hooks/useDebounce";
import AuthComponent from "../Authcontainer";
import { useMutation } from "@tanstack/react-query";
import { useDelay } from "hooks/useDelay";
import { forgetUser } from "services/authServices";
function CreateNewPasswordcomponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

  const registerData = useSelector((state: RootState) => state.register.userData);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showmodal, setshowmodal] = useState(false);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);


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


useDelay(() => {
    if (shouldProceed) {
     setshowmodal(true)
    }
  }, 2000, [shouldProceed]);


  const mutation = useMutation({
    mutationFn: forgetUser,
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

  const handleChangePassword = () => {


    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
  const email=registerData?.email
    // Proceed with registerData + password
    console.log("Final Registration Payload: ", { email, password,confirmPassword });
    const payload={ email, password,confirmPassword}
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
        </AuthComponent>

        <View className="absolute bottom-10 w-full px-6">
          <View className="items-center w-full">
            <ButtonComponent
              color={primaryColor}
              text="Register"
              textcolor="#fff"
              onPress={handleChangePassword}
              isLoading={mutation.isPending}
              disabled={!password || !confirmPassword}
            />
            <View className="h-5" />
          </View>
        </View>
      </View>
    </>
  );
}

export default CreateNewPasswordcomponent;
