import { View, Text, TouchableOpacity, ActivityIndicator} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../emptyview";
import InputComponent from "../controls/textinput";
import { useRouter } from "expo-router";
import PasswordComponent from "../controls/passwordinput";
import BackComponent from "../backcomponent";
import CenteredTextComponent from "../centeredtextcomponent";
import { login } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "services/authServices";
import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useSecureAuth } from "hooks/useSecureAuth"


interface UserDetails {
  firstname: string;
  lastname: string;
  email: string;
}

function LoginComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const { saveAuthData } = useSecureAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [errorMessage]);

  const router = useRouter();
  const dispatch=useDispatch()

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess:async (response) => {
      const { user, token } = response.data;
    
       await saveAuthData(user, token); // Save securely
      dispatch(login({ user, token }));
  
      console.log("login success:", user);
      if(user.role==='client'){
        router.replace("/homelayout");
      }
      else{
        router.replace("/homeprofessionalayout");
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
  

  const handleSign = () => {
    setErrorMessage(null); // clear previous error
    const payload = { email, password };
    if(!email){
      setErrorMessage("Please Enter Email")
      return
    }
    if(!password){
      setErrorMessage("Please Enter Password")
    }
    mutation.mutate(payload);
  };
  return (
    <>
     {errorMessage && (
       <AlertMessageBanner type="error" message={errorMessage} />
     )}
   
  <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
  
  <StatusBar style="auto" />
  <EmptyView />
  <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor}/>
  <EmptyView />
  <CenteredTextComponent textcolor={primaryTextColor} text=" Sign in as a Client"/>

  <View className="h-10"></View>

  <View className="items-center">
    <InputComponent value={email} onChange={(text)=>setEmail(text)} color={primaryColor} placeholder="Email" placeholdercolor={secondaryTextColor}/>
    <View className="h-5"></View>
    <PasswordComponent value={password} onChange={(text)=>setPassword(text)} color={primaryColor} placeholder="Password" placeholdercolor={secondaryTextColor}/>
  </View>

  <View className="h-5"></View>
  <View className="w-full flex-row justify-end">
    <TouchableOpacity onPress={()=> router.navigate("/recoverpasswordscreen")}>
      <Text style={{ color: primaryColor }} className="text-base">
        Forgot Password?
      </Text>
    </TouchableOpacity>
  </View>

  <View className="absolute bottom-10 left-5 justify-center items-center w-full">
  <TouchableOpacity
  disabled={!email || !password || mutation.isPending}
  style={{
    backgroundColor: primaryColor,
    opacity: mutation.isPending? 0.6 : 1,
  }}
  className="w-11/12 h-14 rounded-lg justify-center items-center"
  onPress={handleSign}
>
{mutation.isPending ? (
  <ActivityIndicator color="#fff" />
) : (
  <Text className="text-white text-lg font-bold text-center">Login</Text>
)}
</TouchableOpacity>

    <View className="h-5"></View>
    <View className="flex-row w-3.5/5 justify-between">
      <Text className="text-gray-400 text-base">Don’t have an account? </Text>
      <TouchableOpacity onPress={()=>router.navigate("/registerscreen")}>
        <Text style={{ color: primaryColor }} className="text-base font-bold">
          Register Now
        </Text>
      </TouchableOpacity>
    </View>
    <EmptyView />
  </View>
</View>
</>

  );
}

export default LoginComponent;
 

