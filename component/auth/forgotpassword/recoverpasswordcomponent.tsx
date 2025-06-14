import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getColors } from "../../../static/color";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import EmptyView from "../../emptyview";
import CenteredTextComponent from "../../centeredtextcomponent";
import InputComponent from "../../controls/textinput";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useDelay } from "hooks/useDelay";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import BackComponent from "component/backcomponent";
import ButtonComponent from "component/buttoncomponent";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/registerSlice";
import { useRouter } from "expo-router";

function RecoverPassword() {
  const { theme } = useTheme();
  const dispatch=useDispatch()
  const router=useRouter()
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor, subText } = getColors(theme);
  const [isChecked, setIsChecked] = useState(false);
  const [email,setEmail]=useState<any>('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState<boolean>(false);

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
        console.log('ok')
        dispatch(setRegistrationData({ email }));
        router.push("/verifyotpscreen");
      }
    }, 2000, [shouldProceed]);
  
    const mutation = useMutation({
      mutationFn: sendOtp,
      onSuccess: (data) => {
      console.log(data)
      const emailSendStatus=data.data.emailSendStatus
      if(emailSendStatus){
        setSuccessMessage('OTP send to  Email')
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
  

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const submitFn=()=>{
    if (!email) {
          setErrorMessage('Please fill both fields')
          return;
        }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+234[0-9]{10}$/; // Ensures +234 followed by 10 digits
    
      if (!emailRegex.test(email)) {
        setErrorMessage("Please enter a valid email address");
        return;
      }
 
      const payload={email,"type": "EMAIL","reason": "forgot_password"}
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
  
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
      <StatusBar style="auto" />
      <EmptyView />
      <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor} />
      <EmptyView />
      <CenteredTextComponent textcolor={primaryTextColor} text="Recover Password" />
      <View className="p-6">
<Text style={{color: subText}}>Please enter the email associated with your account to reset your password.</Text>
</View>
      <View className="items-center">
       <InputComponent value={email} onChange={(text)=>setEmail(text)} color={primaryColor} placeholder="Email" placeholdercolor={secondaryTextColor}/>
       <View className="h-5"></View>
      </View>

      <View className="">
      <ButtonComponent
              color={primaryColor}
              text="Verify "
              textcolor="#fff"
              onPress={submitFn}
              isLoading={mutation.isPending}
              disabled={!email}
            />
      </View>
    </View>
    </>
  );
}

export default RecoverPassword;
