import { Image, View, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import RatingStar from "component/rating"
import { Entypo, FontAwesome5 } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"

export const UserDetail = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const user=useSelector((state:RootState)=>state.auth.user)

    const avatar:string=user?.profile?.avatar || ' '
    const fullName:string= user?.profile?.firstName + ' ' + user?.profile?.lastName || ' '
    const location:string=user?.location?.lga + ', ' + user?.location?.state || ' '
    const numberOfStars:number=user?.profile?.rate || 1
    const currentBalance:number | string=user?.wallet?.currentBalance || ' '
    const isVerified:boolean=user?.profile?.verified || false


    return (
        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-[12%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View className="w-full items-center flex-row gap-5 justify-center">
            <View className="w-16 h-16 bg-slate-200 rounded-full">
                 <Image resizeMode="contain" className="w-16 rounded-full h-16" source={{uri:avatar}}/>
                 </View>
                <View>
                    <View className="flex-row items-center gap-2">
                        <ThemeText type="primary" size={Textstyles.text_small}>{fullName}</ThemeText>
                        {isVerified && (
                            <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                                <FontAwesome5 name="check-circle" size={12} color="#10b981" />
                                <Text className="text-xs text-green-700 ml-1">Verified</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row  items-center">
                        <Entypo color={secondaryTextColor} name="location-pin" />
                        <ThemeTextsecond size={Textstyles.text_xsma}>{location}</ThemeTextsecond>
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