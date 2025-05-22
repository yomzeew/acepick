import { Image, View } from "react-native"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import RatingStar from "component/rating"
import { Entypo } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"

export const UserDetail = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

    const avatar:string=user?.profile.avatar || ' '
    const fullName:string= user?.profile.firstName +' '+ user?.profile.lastName || ' '
    const lga:string=user?.profile.lga || ' '
    const state:string=user?.profile.state || ' '
    const numberOfStars:number=user?.profile.rate || 1
    const currentBalance:number | string=user?.wallet.currentBalance || ' '


    return (
        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-[12%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View className="w-full items-center flex-row gap-5 justify-center">
            <View className="w-16 h-16 bg-slate-200 rounded-full">
                 <Image resizeMode="contain" className="w-16 rounded-full h-16" source={{uri:avatar}}/>
                 </View>
                <View>
                    <ThemeText type="primary" size={Textstyles.text_small}>{fullName}</ThemeText>
                    <View className="flex-row  items-center">
                        <Entypo color={secondaryTextColor} name="location-pin" />
                        <ThemeTextsecond size={Textstyles.text_xsma}>{lga},{state}</ThemeTextsecond>
                    </View>
                  <RatingStar numberOfStars={numberOfStars}/>
                    <EmptyView height={5} />
                    <View>
                        <ThemeText type="primary" size={Textstyles.text_xsmall}>Wallet Balance:{'₦'+currentBalance}</ThemeText>
                    </View>
                </View>

            </View>


        </View>
    )
}