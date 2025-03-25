import { Image, View } from "react-native"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import RatingStar from "component/rating"
import { Entypo } from "@expo/vector-icons"

export const UserDetail = () => {
    const numberOfStars = 3;
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-[12%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View className="w-full items-center flex-row gap-5 justify-center">
                <Image className="w-16 h-16 rounded-full" resizeMode="contain" source={require('../../assets/demo.jpg')} />
                <View>
                    <ThemeText type="primary" size={Textstyles.text_small}>Oluwadamilola Samuel</ThemeText>
                    <View className="flex-row  items-center">
                        <Entypo color={secondaryTextColor} name="location-pin" />
                        <ThemeTextsecond size={Textstyles.text_xsma}>Akure,Ondo State</ThemeTextsecond>
                    </View>
                  <RatingStar numberOfStars={numberOfStars}/>
                    <EmptyView height={5} />
                    <View>
                        <ThemeText type="primary" size={Textstyles.text_xsmall}>Wallet Balance:₦20,000</ThemeText>
                    </View>
                </View>

            </View>


        </View>
    )
}