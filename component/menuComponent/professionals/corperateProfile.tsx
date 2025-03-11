import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../profilePages/headerComp"
import BackComponent from "component/backcomponent"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ImageBackground, TouchableOpacity, View } from "react-native"
import { Image, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"
import RatingStar from "component/rating"
import EmptyView from "component/emptyview"
import DraggablePanel from "component/bottomSheetcomp"
import { ScrollView } from "react-native-gesture-handler"
import Divider from "component/divider"
import { useState } from "react"

const CorporateProfile = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: primaryColor }} className="h-full w-full">
                <ImageBackground resizeMode="cover" className="w-full flex-1 h-[100%] px-3 pt-[56px]" source={require('../../../assets/profilebg.png')}>
                    <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                    <EmptyView height={40} />
                    <View className="flex-row items-center justify-center w-full">
                    <View className="items-center">
                        <Image resizeMode="contain" source={require('../../../assets/corporate.png')} className="w-28 h-28 rounded-full" />

                    </View>
                    <View>
                    <View className="items-center">
                        <Text style={[Textstyles.text_cmedium, { color: "#ffffff" }]}>Power Tech Electric Services</Text>
                        <EmptyView height={10} />
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Ibadan,Oyo State</Text>
                        </View>
                        <EmptyView height={5} />
                        <View>
                            <RatingStar numberOfStars={4} />
                        </View>
                        <EmptyView height={5} />
                        <View>
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Jobs Completed: 23</Text>
                        </View>

                    </View>
                    <EmptyView height={20} />
                    <View className="flex-row gap-x-3 items-center justify-center">
                        <View className="w-12 h-12 items-center justify-center bg-red-500 rounded-full">
                            <FontAwesome5 color="white" size={16} name="phone" />

                        </View>
                        <View style={{ backgroundColor: primaryColor }} className="w-12 h-12 items-center justify-center rounded-full">
                            <Ionicons name="chatbubbles-sharp" color="white" size={20} />

                        </View>
                        <View className="w-12 h-12 items-center justify-center bg-white rounded-full">
                            <AntDesign name="ellipsis1" size={24} color="black" />

                        </View>

                    </View>

                    </View>
                    
          
                    </View>
                    <DraggablePanel maxHeightPercentage={70} minHeightPercentage={50} backgroundColor={backgroundColor}>
                        <ScrollView contentContainerStyle={{paddingVertical:20}}>
                            <CorporateDetails/>
                        </ScrollView>

                    </DraggablePanel>



                </ImageBackground>
            </View>



        </>
    )
}

export default CorporateProfile


const CorporateDetails=()=>{
    const [active,setactive]=useState('Overview')
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor, selectioncardColor } = getColors(theme)
    const activebg=active==='Overview'?primaryColor:"transparent"
    const activetext=active==='O'
    const handlePress=(value:string)=>{
        setactive(value)

    }
    return(
        <>
        <View className="h-full w-full">
            <View className="h-16 w-full flex-row bg-slate-300">
                <TouchableOpacity onPress={()=>handlePress('Overview')} style={{backgroundColor:active==='Overview'?primaryColor:"transparent"}} className="h-full w-1/3">
                <Text style={[Textstyles.text_small,{color:active==='Overview'?"#ffffff":"transparent"}]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>handlePress('Jobhistroy')} style={{backgroundColor:active==='Jobhistory'?primaryColor:"transparent"}} className="h-full w-1/3">
                <Text style={[Textstyles.text_small,{color:active==='Jobhistory'?"#ffffff":"#333333"}]}>Job Histroy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>handlePress('Review')} style={{backgroundColor:active==='Review'?primaryColor:"transparent"}} className="h-full w-1/3">
                <Text style={[Textstyles.text_small,{color:active==='Review'?"#ffffff":"#333333"}]}>Review</Text>
                </TouchableOpacity>
                

            </View>

        </View>
        </>
    )

}