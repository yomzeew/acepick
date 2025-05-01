import { View,Image, Text, TouchableOpacity } from "react-native"
import LikeIcon from "../icons/likeIcon"
import NotificationIcon from "../icons/notificationIcon"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import {ThemeText} from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { Feather} from "@expo/vector-icons"
import { getColors } from "static/color"
import { useTheme } from "hooks/useTheme"
import { useRouter } from "expo-router"

const HeaderComponent=()=>{
    const {theme}=useTheme()
    const {primaryColor}=getColors(theme)
    const role='professional'

    const navRoute=role==='professional'?'/profileprofessionlayout':'/profilelayout'

    const router=useRouter()
    
    const auth = useSelector((state: RootState) => state.auth.isAuthenticated);
    console.log(auth)
    return(
        <>
        <View className="h-32 pt-10 w-full flex-row justify-between items-center">
            <View className="flex-row gap-2 items-center">
            <Image className="w-16 h-16 rounded-full" resizeMode="contain" source={require('../../assets/demo.jpg')} />
            <View>
                    <ThemeText type="secondary" size={Textstyles.text_xsma}>Good Afternoon</ThemeText>
                    <ThemeText type="secondary" size={Textstyles.text_xmedium}>Oluwadamilola</ThemeText>
                </View>
            </View>
            <View className="flex-row gap-2 items-center">
                <TouchableOpacity onPress={()=>{router.push(navRoute)}}><Feather size={24} color={primaryColor} name="settings" /></TouchableOpacity>
                <TouchableOpacity onPress={()=>{router.push('/notificationLayout')}}><NotificationIcon/></TouchableOpacity>
            </View>
        </View>
        </>
    )
}
export default HeaderComponent