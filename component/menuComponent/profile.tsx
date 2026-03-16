import { StatusBar } from "expo-status-bar"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import ContainerTemplate from "../dashboardComponent/containerTemplate"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import FooterComponent from "../dashboardComponent/footerComponent"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import {  ReactNode, useState } from "react"
import LineChartgraphy from "../chart/linechart"
import {Feather,Entypo, AntDesign,FontAwesome} from '../icons'
import { useRouter } from "expo-router"
import RatingStar from "component/rating"
import { UserDetail } from "component/dashboardComponent/userdetails"
import HeaderComponent from "component/headerComp"
import JobStatistics from "component/jobStatistics"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"


const ProfileComponent = () => {
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor } = getColors(theme)
    const routes=useRouter()
    const [refreshKey, setRefreshKey] = useState(0)
    
    const handleNavigationToReviews=()=>{
        routes.push('/reviewlayout')
    }
    
    const handleNavigationToSettings=()=>{
        routes.push('/profilesettinglayout')
    }
    
    const handleNavigationToEditProfile=()=>{
        routes.push('/profileeditlayout')
    }
    
    const handleNavigationToProfessions=()=>{
        routes.push('/profileprofessionlayout')
    }
    
    const handleNavigationToNotifications=()=>{
        routes.push('/notificationapplayout')
    }
    
    const handleNavigationToBillHistory=()=>{
        routes.push('/billhistorylayout')
    }
    
    const handleNavigationToFAQ=()=>{
        routes.push('/faqlayout')
    }
    
    const handleNavigationToPasswordChange=()=>{
        routes.push('/passwordchangelayout')
    }
    
    const handleNavigationToResetPin=()=>{
        routes.push('/resetpinlayout')
    }
    
    const handleNavigationToSupport=()=>{
        routes.push('/supportlayout')
    }
    
    const handleNavigationToTerms=()=>{
        routes.push('/termsandprivacylayout')
    }
    
    const handleNavigationToSwitchProfessional=()=>{
        routes.push('/switchtoprofessionallayout')
    }
    
    // Refresh profile data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // This will be called when the screen comes into focus
            setRefreshKey((prev: number) => prev + 1)
            return () => {
                // Cleanup if needed
            }
        }, [])
    )
    
    const user=useSelector((state:RootState)=>state?.auth.user)
    const numberofDisputes=user?.profile.totalDisputes || 0
    const numberofReview=user?.profile.totalReview || 0
    return (
        <>
            <ContainerTemplate>
            <HeaderComponent title={"Profile"}/>
                <EmptyView height={10} />
                <UserDetail key={`userdetail-${refreshKey}`} />
                <EmptyView height={10} />

                <AnalyticDiagram key={`analytics-${refreshKey}`}/>
                <JobStatistics key={`jobstats-${refreshKey}`}/>

                <View  className="w-full">
                    <TouchableOpacity onPress={() => routes.push('/jobstatusLayout/[jobstatus]?status=DISPUTED')}>
                    <ListTab>
                        <FontAwesome name="warning" size={20} color="red" /> {'Disputes'}({numberofDisputes})
                    </ListTab>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNavigationToReviews}>
                    <ListTab>
                        <FontAwesome name="star" size={20} color="gold" /> {'Reviews & Ratings'}({numberofReview})
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToEditProfile}>
                    <ListTab>
                        <FontAwesome name="edit" size={20} color="blue" /> {'Edit Profile'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToSettings}>
                    <ListTab>
                        <FontAwesome name="cog" size={20} color="gray" /> {'Settings'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToProfessions}>
                    <ListTab>
                        <FontAwesome name="briefcase" size={20} color="green" /> {'My Professions'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToNotifications}>
                    <ListTab>
                        <FontAwesome name="bell" size={20} color="orange" /> {'Notifications'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToBillHistory}>
                    <ListTab>
                        <FontAwesome name="file" size={20} color="purple" /> {'Bill History'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToFAQ}>
                    <ListTab>
                        <FontAwesome name="question-circle" size={20} color="teal" /> {'FAQ'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToSupport}>
                    <ListTab>
                        <FontAwesome name="phone" size={20} color="indigo" /> {'Support'}
                    </ListTab>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNavigationToTerms}>
                    <ListTab>
                        <FontAwesome name="lock" size={20} color="darkgreen" /> {'Terms & Privacy'}
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


