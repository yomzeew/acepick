import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView} from "react-native";
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
import { AxiosError } from "axios";
import Checkbox from "../controls/checkbox";


interface UserDetails {
  firstname: string;
  lastname: string;
  email: string;
}

function LoginComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const { saveAuthData, getRememberedCredentials, saveRememberedCredentials } = useSecureAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Load remembered credentials on component mount
    const loadCredentials = async () => {
      const credentials = await getRememberedCredentials();
      if (credentials.rememberMe) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, [getRememberedCredentials]);
  
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
    
      // Save remembered credentials if remember me is checked
      await saveRememberedCredentials(email, password, rememberMe);
      
      await saveAuthData(user, token); // Save securely
      dispatch(login({ user, token }));
  
      console.log("login success:", user);
      if(user.role==='client'){
        router.replace("/homelayout");
      }
      else if(user.role==='delivery'){
        router.replace("/deliverydashboardlayout")

      }
      else{
        router.replace("/homeprofessionalayout");
      }
      
    },
    onError: (error:any) => {
      let msg = "An unexpected error occurred";

      if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        msg = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401 || status === 400) {
          const backendMsg = data?.message || data?.error || "";
          const normalized = backendMsg.toLowerCase();
          if (
            normalized.includes("user does not exist") ||
            normalized.includes("invalid password") ||
            normalized.includes("wrong password") ||
            normalized.includes("not found") ||
            normalized.includes("invalid credentials") ||
            normalized.includes("unauthorized")
          ) {
            msg = "Invalid email or password";
          } else {
            msg = backendMsg || "Invalid email or password";
          }
        } else if (status === 429) {
          msg = "Too many login attempts. Please wait a moment and try again.";
        } else if (status >= 500) {
          msg = "Server is temporarily unavailable. Please try again later.";
        } else {
          msg = data?.message || data?.error || `Request failed (${status})`;
        }
      } else if (error?.request) {
        msg = "Server is not responding. Please try again later.";
      } else if (error?.message) {
        msg = error.message;
      }

      setErrorMessage(msg);
      console.error("Login failed:", msg);
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
      return
    }
    mutation.mutate(payload);
  };
  return (
    <>
     {errorMessage && (
       <AlertMessageBanner type="error" message={errorMessage} />
     )}
   
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: backgroundColor }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
  >
  <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
  <View style={{ backgroundColor: backgroundColor }} className="flex-1 w-full p-6">
  
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

  <View className="h-8"></View>
  <View className="w-full flex-row justify-end">
    <TouchableOpacity onPress={()=> router.navigate("/recoverpasswordscreen")}>
      <Text style={{ color: primaryColor }} className="text-base">
        Forgot Password?
      </Text>
    </TouchableOpacity>
  </View>

  <View className="h-6"></View>
  <View className="w-full flex-row justify-start">
    <Checkbox 
      isChecked={rememberMe} 
      onToggle={setRememberMe}
    />
    <Text style={{ color: secondaryTextColor }} className="text-base ml-2">
      Remember Me
    </Text>
  </View>

  <View className="flex-1" />

  <View className="pb-10 justify-center items-center w-full">
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
      <Text className="text-gray-400 text-base">Don't have an account? </Text>
      <TouchableOpacity onPress={()=>router.navigate("/registerscreen")}>
        <Text style={{ color: primaryColor }} className="text-base font-bold">
          Register Now
        </Text>
      </TouchableOpacity>
    </View>
    <EmptyView />
  </View>
</View>
</ScrollView>
</KeyboardAvoidingView>
</>

  );
}

export default LoginComponent;
 

