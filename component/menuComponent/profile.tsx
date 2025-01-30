import { StatusBar } from "expo-status-bar"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ContainerTemplate from "../dashboardComponent/containerTemplate"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import FooterComponent from "../dashboardComponent/footerComponent"
import { AntDesign, Entypo, Feather, FontAwesome5 } from "@expo/vector-icons"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import { memo } from "react"
import LineChartgraphy from "../chart/linechart"


const ProfileComponent = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor } = getColors(theme)

    return (
        <>
            <ContainerTemplate>
                <View className="pt-12  justify-between flex-row items-center">
                    <ThemeText type="primary" size={Textstyles.text_medium} >Profile</ThemeText>
                    <TouchableOpacity>
                        <Feather size={24} color={primaryColor} name="settings" />
                    </TouchableOpacity>
                </View>
                <EmptyView height={10} />
                <UserDetail />
                <EmptyView height={10} />
                <AnalyticDiagram/>
                <View  className="w-full  mt-2 flex-1 pb-20">
                    <ScrollView  horizontal   showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-x-4">
                        <Cardcomponent Title={"Completed Jobs"} totalnumber={4} />
                        <Cardcomponent Title={"Completed Jobs"} totalnumber={4} />
                        <Cardcomponent Title={"Completed Jobs"} totalnumber={4} />
                        <Cardcomponent Title={"Cancel Jobs"} totalnumber={4} />
                        </View>
                       
                    </ScrollView>
                </View>
                


            </ContainerTemplate>
        </>
    )
}
export default memo(ProfileComponent)
export const UserDetail = () => {
    const numberOfStars = 3;
    const remainStar=5-numberOfStars
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
                    <View className="flex-row">
                        {Array.from({ length: numberOfStars }).map((_, index) => (
                            <AntDesign color="gold" key={index} name="star" />
                        ))}
                           {Array.from({ length:remainStar  }).map((_, index) => (
                            <AntDesign color="gold" key={index} name="staro" />
                        ))}


                    </View>
                    <EmptyView height={5} />
                    <View>
                        <ThemeText type="primary" size={Textstyles.text_xsmall}>Wallet Balance:₦20,000</ThemeText>
                    </View>
                </View>

            </View>


        </View>
    )
}
export const AnalyticDiagram=()=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
        <>
        <View className="w-full h-auto rounded-2xl  px-5 py-3 ">
            <LineChartgraphy/>
            <View className="flex-row justify-between">
            <View className="items-center flex-col">
                <ThemeText size={Textstyles.text_xsma} type="primary">Total Money Spent</ThemeText>
                <ThemeText size={Textstyles.text_medium} type="secondary">₦330,000</ThemeText>
            </View>
            <View className="items-center flex-col">
                <ThemeText size={Textstyles.text_xsma}><Text className="text-red-500">Total Monthly Spent</Text></ThemeText>
                <ThemeText size={Textstyles.text_medium} type="secondary">₦3,300</ThemeText>
            </View>


            </View>
          
        </View>
        </>
    )
}

export const ListTab=({Title,totalnumber}:{Title:string,totalnumber:number})=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
<View className="w-full h-16 rounded-2xl px-5 py-3 mt-2 border-b border-b-slate-400 ">
    <View className="w-full flex-row px-3 justify-between items-center h-full">
    <View>
        <ThemeTextsecond size={Textstyles.text_xmedium}>{Title} ({totalnumber})</ThemeTextsecond>
    </View>
    <AntDesign name="right" size={24} color={secondaryTextColor} />

    </View>


  </View>
    )
   
}

const Cardcomponent=({Title,totalnumber}:{Title:string,totalnumber:number})=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
<View  style={{ backgroundColor: selectioncardColor, elevation: 4 }}  className="w-44 h-24 rounded-2xl px-5 py-3 mt-2 -slate-400 ">
<View className="w-full px-3 justify-center items-center h-full">
    <View>
        <ThemeTextsecond size={Textstyles.text_xsma}>{Title}</ThemeTextsecond>
    </View>
    <View>
        <ThemeTextsecond size={Textstyles.text_xmedium}>{totalnumber}</ThemeTextsecond>
    </View>
    
    </View>


</View>
    )


}
