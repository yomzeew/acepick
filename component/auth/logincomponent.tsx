import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StatusBar } from "expo-status-bar";
import EmptyView from "../emptyview";
import InputComponent from "../controls/textinput";
import { useRouter } from "expo-router";
import PasswordComponent from "../controls/passwordinput";
import BackComponent from "../backcomponent";
import CenteredTextComponent from "../centeredtextcomponent";

function LoginComponent() {
  const { theme } = useTheme(); // Theme state and toggle function
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
  const router = useRouter()
  return (
    <View style={{ backgroundColor: backgroundColor }} className="h-full w-full p-6">
  <StatusBar style="auto" />
  <EmptyView />
  <BackComponent bordercolor={primaryColor} textcolor={secondaryTextColor}/>
  <EmptyView />
  <CenteredTextComponent textcolor={primaryTextColor} text=" Sign in as a Client"/>

  <View className="h-10"></View>

  <View className="items-center">
    <InputComponent color={primaryColor} placeholder="Email" placeholdercolor={secondaryTextColor}/>
    <View className="h-5"></View>
    <PasswordComponent color={primaryColor} placeholder="Password" placeholdercolor={secondaryTextColor}/>
  </View>

  <View className="h-5"></View>
  <View className="w-full flex-row justify-end">
    <TouchableOpacity onPress={()=> router.navigate("/recoverpasswordscreen")}>
      <Text style={{ color: primaryColor }} className="text-base">
        Forgot Password?
      </Text>
    </TouchableOpacity>
  </View>

  <View className="absolute bottom-0 left-5 justify-center items-center w-full">
    <TouchableOpacity
      style={{ backgroundColor: primaryColor, }}
      className="w-11/12 h-14 rounded-lg justify-center items-center"
    >
      <Text className="text-white text-lg font-bold text-center">Login</Text>
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

  );
}

export default LoginComponent;
