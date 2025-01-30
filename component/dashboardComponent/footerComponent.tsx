import { View, TouchableOpacity,Text  } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { FontAwesome5 } from "@expo/vector-icons"
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useDispatch, useSelector } from "react-redux";
import { setActivePage } from "../../redux/authSlice";
import { RootState } from "../../redux/store";
import { useRouter } from "expo-router";
import { memo } from "react";

const FooterComponent=()=>{
    const {theme} =useTheme()
    const activePage=useSelector((state:RootState)=>state.auth.activePage)
    const dispatch=useDispatch()
    const route=useRouter()

    const bgcoloractive=theme === "dark" ? "#033A62" : "#ffffff"
    const textcoloractive= theme === "dark" ? "#ffffff" : "#033A62" 
    const bgcolornonactive=''
    const textcolornonactive=theme === "dark" ? "#ffffff" : "#ffffff"

    const handlenavigation=(value:string,routes:string)=>{
      dispatch(setActivePage(value))
      route.push(routes)
     
    }
   
    
    return(
        <>
        <View
  style={{
    backgroundColor: theme === "dark" ? "#333333" : "#033A62",
    borderRadius: 40,
    elevation: 4, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }}
  className="w-auto absolute bottom-5 h-16 justify-center gap-3 flex-row"
>
  <TouchableOpacity
    style={{
      backgroundColor: activePage === "Home" ? bgcoloractive : "",
      borderRadius: 24,
    }}
    className="w-24 justify-center items-center"
    onPress={()=>handlenavigation("Home","/homelayout")}
  >
    <View className="items-center">
      <FontAwesome5 color={activePage === "Home" ? textcoloractive : textcolornonactive} size={20} name="home" />
      <Text style={{ color: activePage === "Home" ? textcoloractive : textcolornonactive}}>Home</Text>
    </View>
  </TouchableOpacity>
  <TouchableOpacity
    style={{
      backgroundColor: activePage === "Chat" ? bgcoloractive : "",
      borderRadius: 24,
    }}
    className="w-24 justify-center items-center"
    onPress={()=>handlenavigation("Chat","/chatlayout")}
  >
    <View className="items-center">
    <Ionicons name="chatbubbles-sharp" color={activePage === "Chat" ? textcoloractive : textcolornonactive} size={20} />
      <Text style={{ color: activePage === "Chat" ? textcoloractive : textcolornonactive}}>Chat</Text>
    </View>
  </TouchableOpacity>
  <TouchableOpacity
    style={{
      backgroundColor: activePage === "Market" ? bgcoloractive : "",
      borderRadius: 24,
    }}
    className="w-24 justify-center items-center"
    onPress={()=>handlenavigation("Market","/marketlayout")}
  >
    <View className="items-center">
    <Entypo name="shop" color={activePage === "Market" ? textcoloractive : textcolornonactive} size={20} />
      <Text style={{ color: activePage === "Market" ? textcoloractive : textcolornonactive}}>Market</Text>
    </View>
  </TouchableOpacity>
  <TouchableOpacity
    style={{
      backgroundColor: activePage === "Profile" ? bgcoloractive : "",
      borderRadius: 24,
    }}
    className="w-24 justify-center items-center"
    onPress={()=>handlenavigation("Profile","/profilelayout")}
  >
    <View className="items-center">
      <FontAwesome5 color={activePage === "Profile" ? textcoloractive : textcolornonactive} size={20} name="user" />
      <Text style={{ color: activePage === "Profile" ? textcoloractive : textcolornonactive }}>Profile</Text>
    </View>
  </TouchableOpacity>
</View>

        </>
    )
} 
export default memo(FooterComponent)