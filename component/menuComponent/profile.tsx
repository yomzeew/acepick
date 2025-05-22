import { StatusBar } from "expo-status-bar"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ContainerTemplate from "../dashboardComponent/containerTemplate"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import FooterComponent from "../dashboardComponent/footerComponent"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import {  ReactNode } from "react"
import LineChartgraphy from "../chart/linechart"
import {Feather,Entypo, AntDesign,FontAwesome} from '../icons'
import { useRouter } from "expo-router"
import RatingStar from "component/rating"
import { UserDetail } from "component/dashboardComponent/userdetails"
import HeaderComponent from "component/headerComp"
import JobStatistics from "component/jobStatistics"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"


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
    const user=useSelector((state:RootState)=>state.auth.user)
    const numberofDisputes=user?.profile.totalDisputes || 0
    const numberofReview=user?.profile.totalReview || 0
    return (
        <>
            <ContainerTemplate>
            <HeaderComponent title={"Profile"}/>
                <View className="w-full items-end -mt-5">
                    <TouchableOpacity onPress={handleNavigationSettings}>
                        <Feather size={24} color={primaryColor} name="settings" />
                    </TouchableOpacity>
                </View>
                <EmptyView height={10} />
                <UserDetail />
                <EmptyView height={10} />

                <AnalyticDiagram/>
                <JobStatistics/>

                <View  className="w-full">
                    <TouchableOpacity>
                    <ListTab>
                        <FontAwesome name="warning" size={20} color="red" /> {'Disputes'}({numberofDisputes})
                    </ListTab>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNavigation}>
                    <ListTab>
                        <FontAwesome name="star" size={20} color="gold" /> {'Reviews & Ratings'}({numberofReview})
                    </ListTab>
                    </TouchableOpacity>
                    

                </View>
                


            </ContainerTemplate>
        </>
    )
}
export default ProfileComponent
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


