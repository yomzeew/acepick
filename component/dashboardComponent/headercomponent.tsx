import { View,Image, TouchableOpacity } from "react-native"
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
    const user= useSelector((state: RootState) => state?.auth?.user);
    const role=user?.role

    const navRoute=role==='professional'?'/profileprofessionlayout':'/profilelayout'

    const router=useRouter()
    
    const auth = useSelector((state: RootState) => state.auth?.isAuthenticated);
    const clientName:string= user?.profile.firstName  || ' '
    const avatar:string=user?.profile.avatar || ' '

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
      };

    console.log(auth)
    return(
        <>
        <View className="h-32 pt-10 w-full flex-row justify-between items-center">
            <View className="flex-row gap-2 items-center">
            <Image className="w-16 h-16 rounded-full" resizeMode="contain" source={{uri:avatar}} />
            <View>
                    <ThemeText type="secondary" size={Textstyles.text_xsma}>{getGreeting()}</ThemeText>
                    <ThemeText type="secondary" size={Textstyles.text_xmedium}>{clientName}</ThemeText>
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