import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
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
import SelectionCard from "component/SelectionCard"

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

                        <CorporateDetails />


                    </DraggablePanel>



                </ImageBackground>
            </View>



        </>
    )
}

export default CorporateProfile


const CorporateDetails = () => {
    const [active, setactive] = useState('Overview')
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor, selectioncardColor } = getColors(theme)
    const handlePress = (value: string) => {
        setactive(value)
    }
    return (
        <>
            <View className="h-full flex-col w-full mt-5">
                <View className="h-16 w-full flex-row bg-slate-300">
                    <TouchableOpacity onPress={() => handlePress('Overview')} style={{ backgroundColor: active === 'Overview' ? "#33658A" : "transparent" }} className="h-full w-1/3 items-center justify-center">
                        <Text style={[Textstyles.text_small, { color: active === 'Overview' ? "#ffffff" : "#333333" }]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePress('Jobhistory')} style={{ backgroundColor: active === 'Jobhistory' ? "#33658A" : "transparent" }} className="h-full w-1/3 items-center justify-center">
                        <Text style={[Textstyles.text_small, { color: active === 'Jobhistory' ? "#ffffff" : "#333333" }]}>Job History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePress('Review')} style={{ backgroundColor: active === 'Review' ? "#33658A" : "transparent" }} className="h-full w-1/3 items-center justify-center">
                        <Text style={[Textstyles.text_small, { color: active === 'Review' ? "#ffffff" : "#333333" }]}>Review</Text>
                    </TouchableOpacity>

                </View>
                <EmptyView height={20} />
                {active==='Overview'&&<Overview />}
                {active==='Jobhistory'&&<History/>}
                {active==='Review'&&<Review/>}

            </View>
        </>
    )

}
const Overview = () => {
    return (
        <>
            <View className="w-full px-3 flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <ThemeText size={Textstyles.text_cmedium}>
                        Overview
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        At PowerTech Electric Services, we illuminate the future
                        through seamless electrical solutions. Our team of expert
                        electricians brings brilliance to projects, ensuring safety
                        and precision. With a commitment to innovation, we energize
                        spaces, foster connections, and empower a brighter tomorrow
                    </ThemeTextsecond>
                    <EmptyView height={20} />
                    <ThemeText size={Textstyles.text_cmedium}>
                        Mission
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        To be the forefront of innovative electrical solutions,
                        enriching lives through reliable connections and expertly lit environments.
                    </ThemeTextsecond>
                    <EmptyView height={20} />
                    <ThemeText size={Textstyles.text_cmedium}>
                        Vision
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Our mission is to electrify your visions. We deploy skilled electricians
                        and cutting-edge technology to deliver safe, efficient,
                        and sustainable electrical solutions.
                    </ThemeTextsecond>
                    <EmptyView height={20} />
                    <ThemeText size={Textstyles.text_cmedium}>
                        Services
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Our mission is to electrify your visions. We deploy skilled electricians
                        and cutting-edge technology to deliver safe, efficient,
                        and sustainable electrical solutions.
                    </ThemeTextsecond>
                    <EmptyView height={20} />
                    <ThemeText size={Textstyles.text_cmedium}>
                        Certificate and Award
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Our mission is to electrify your visions. We deploy skilled electricians
                        and cutting-edge technology to deliver safe, efficient,
                        and sustainable electrical solutions.
                    </ThemeTextsecond>
                    <EmptyView height={20} />
                    <ThemeText size={Textstyles.text_cmedium}>
                        Social Media
                    </ThemeText>
                    <Divider />
                    <EmptyView height={10} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        <FontAwesome5 size={16} name="facebook" /> Power Tech Electric
                    </ThemeTextsecond>
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        <FontAwesome5 size={16} name="instagram" /> Power Tech Electric
                    </ThemeTextsecond>
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        <FontAwesome5 size={16} name="tiktok" /> Power Tech Electric
                    </ThemeTextsecond>
                </ScrollView >
            </View>
        </>
    )
}

const History = () => {
    return (
        <>
            <View className="w-full px-3 flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <HistoryCard />
                    <EmptyView height={20} />
                    <HistoryCard />
                    <EmptyView height={20} />
                    <HistoryCard />
                    <EmptyView height={20} />
                    <HistoryCard />
                    <EmptyView height={20} />
                </ScrollView >
            </View>
        </>
    )
}
const HistoryCard = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <>
            <SelectionCard height={144}>
                <View className="flex-row justify-between">
                    <View className="flex-row gap-x-2">
                        <Image className="w-6 h-6 rounded-full" resizeMode="contain" source={require('../../../assets/profilepc.png')} />
                        <ThemeText size={Textstyles.text_xsmall}>
                            Amoke Julinnah
                        </ThemeText>

                    </View>
                    <View className="bg-green-500 rounded-lg h-6 px-2">
                        <Text style={[Textstyles.text_xsmall,{color:"#ffffff"}]}>Progress</Text>
                    </View>
                    </View>
                    <EmptyView height={10} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            Fix and wire the electical of 3 bedroom flats
                            Fix and wire the electical of 3 bedroom flats
                            Fix and wire the electical of 3 bedroom flats
                        </ThemeTextsecond>
                        <Divider />
                        <EmptyView height={10} />
                    </View>
                    <View className="flex-row justify-between">
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                                July 23, 2023
                            </Text>
                        </View>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="clock" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                                3 month ago
                            </Text>
                        </View>


                    </View>

             
            </SelectionCard>
        </>
    )
}
const Review=()=>{
    return(
        <>
         <View className="w-full px-3 flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    <ReviewCard />
                    <EmptyView height={20} />
                    <ReviewCard />
                    <EmptyView height={20} />
                    <ReviewCard />
                    <EmptyView height={20} />
                    <ReviewCard/>
                    <EmptyView height={20} />
                </ScrollView >
            </View>
        </>
    )
}

const ReviewCard = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <>
            <SelectionCard height={144}>
                <View className="flex-row justify-between">
                    <View>
                        <Image className="w-6 h-6 rounded-full" resizeMode="contain" source={require('../../../assets/profilepc.png')} />
                        <ThemeText size={Textstyles.text_xsmall}>
                            Amoke Julinnah
                        </ThemeText>

                    </View>
                    </View>
                    <EmptyView height={10} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            Fix and wire the electical of 3 bedroom flats
                            Fix and wire the electical of 3 bedroom flats
                            Fix and wire the electical of 3 bedroom flats
                        </ThemeTextsecond>
                        <Divider />
                        <EmptyView height={10} />
                    </View>
                    <View className="flex-row justify-between">
                        <View className="flex-row gap-x-2">
                        <RatingStar numberOfStars={4} />
                        </View>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="clock" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                                3 month ago
                            </Text>
                        </View>


                    </View>

             
            </SelectionCard>
        </>
    )
}