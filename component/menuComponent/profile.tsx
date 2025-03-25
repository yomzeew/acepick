import { StatusBar } from "expo-status-bar"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ContainerTemplate from "../dashboardComponent/containerTemplate"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import FooterComponent from "../dashboardComponent/footerComponent"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import { memo, ReactNode } from "react"
import LineChartgraphy from "../chart/linechart"
import {Feather,Entypo, AntDesign,FontAwesome} from '../icons'
import { useRouter } from "expo-router"
import RatingStar from "component/rating"
import { UserDetail } from "component/dashboardComponent/userdetails"


const ProfileComponent = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor } = getColors(theme)
    const routes=useRouter()
    const handleNavigation=()=>{
        routes.push('/reviewlayout')
    }
    const handleNavigationSettings=()=>{
        routes.push('/profilesettinglayout')
    }

    return (
        <>
            <ContainerTemplate>
                <View className="pt-[60px]  justify-between flex-row items-center">
                    <ThemeText type="primary" size={Textstyles.text_medium} >Profile</ThemeText>
                    <TouchableOpacity onPress={handleNavigationSettings}>
                        <Feather size={24} color={primaryColor} name="settings" />
                    </TouchableOpacity>
                </View>
                <EmptyView height={10} />
                <UserDetail />
                <EmptyView height={10} />
                <AnalyticDiagram/>
                <View  className="w-full  mt-2">
                    <ScrollView  horizontal   showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-x-4">
                        <Cardcomponent Title={"Completed Jobs"} totalnumber={4} />
                        <Cardcomponent Title={"Jobs in Progress"} totalnumber={6} />
                        <Cardcomponent Title={"Pending Jobs"} totalnumber={5} />
                        <Cardcomponent Title={"Cancelled Jobs"} totalnumber={1} />
                        <Cardcomponent Title={"Rejected Jobs"} totalnumber={0} />
                        </View>
                       
                    </ScrollView>
                </View>
                <View  className="w-full">
                    <TouchableOpacity>
                    <ListTab>
                        <FontAwesome name="warning" size={20} color="red" /> {'Disputes'}({4})
                    </ListTab>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNavigation}>
                    <ListTab>
                        <FontAwesome name="star" size={20} color="gold" /> {'Reviews & Ratings'}({10})
                    </ListTab>
                    </TouchableOpacity>
                    

                </View>
                


            </ContainerTemplate>
        </>
    )
}
export default memo(ProfileComponent)
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

export const ListTab=({children}:{children:ReactNode})=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
<View className="w-full h-16 rounded-2xl px-5 py-3 mt-2 border-b border-b-slate-400 ">
    <View className="w-full flex-row px-3 justify-between items-center h-full">
    <View>
        <ThemeTextsecond size={Textstyles.text_xmedium}>{children}</ThemeTextsecond>
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
