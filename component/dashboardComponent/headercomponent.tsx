import { View,Image, Text } from "react-native"
import LikeIcon from "../icons/likeIcon"
import NotificationIcon from "../icons/notificationIcon"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import {ThemeText} from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"

const HeaderComponent=()=>{
    
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
           
            <View className="flex-row gap-2">
                <LikeIcon/>
                <NotificationIcon/>
            </View>
        </View>
        </>
    )
}
export default HeaderComponent