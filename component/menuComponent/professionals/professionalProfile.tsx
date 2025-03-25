import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import BackComponent from "component/backcomponent"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ImageBackground, View } from "react-native"
import { Image, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"
import RatingStar from "component/rating"
import EmptyView from "component/emptyview"
import DraggablePanel from "component/bottomSheetcomp"
import { ScrollView } from "react-native-gesture-handler"
import Divider from "component/divider"

const ProfessionalProfile = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: primaryColor }} className="h-full w-full">
                <ImageBackground resizeMode="cover" className="w-full flex-1 h-[100%] px-3 pt-[56px]" source={require('../../../assets/profilebg.png')}>
                    <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                    <EmptyView height={20} />
                    <View className="w-full items-center">
                        <Image resizeMode="contain" source={require('../../../assets/profilepc.png')} className="w-32 h-32 rounded-full" />

                    </View>
                    <EmptyView height={20} />
                    <View className="items-center">
                        <Text style={[Textstyles.text_cmedium, { color: "#ffffff" }]}>Adeze Okoro</Text>
                        <EmptyView height={10} />
                        <View className="flex-row">
                            <FontAwesome5 color="red" name="toolbox" size={15} />
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>Electrician</Text>
                            <Text style={[Textstyles.text_xsma, { color: "#ffffff" }]}>3 years</Text>
                        </View>
                        <EmptyView height={5} />
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
                    <DraggablePanel backgroundColor={backgroundColor}>
                        <ScrollView contentContainerStyle={{paddingVertical:20}}>
                            <ProfessionalDetails />
                        </ScrollView>

                    </DraggablePanel>



                </ImageBackground>
            </View>



        </>
    )
}

export default ProfessionalProfile

const ProfessionalDetails = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo, backgroundColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <View className="w-full h-full rounded-t-2xl px-3">
                <ThemeText size={Textstyles.text_medium}>
                    Overview
                </ThemeText>
                <View className={`${theme === "dark" ? "border-slate-300" : "border-slate-400"} border-b`} />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_cmedium} >
                    About
                </ThemeText>
                <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                    I am an experienced electrician with a passion for safe and efficient electrical
                    solutions. With [number of years] years in the field, I take pride in delivering
                    top-quality workmanship for residential and commercial projects. My focus is on
                    adhering to industry standards and ensuring your electrical systems run flawlessly.
                    From installations to repairs, count on me to brighten up your spaces with care and
                    dedication. Safety is my priority, and I'm committed to providing worry-free
                    solutions for all your electrical needs. Let me be your guiding light when it comes
                    to electrifying your spaces.
                </Text>
                <ThemeText size={Textstyles.text_cmedium} >
                    Work Experience
                </ThemeText>

                <View>
                    <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor, }]}>
                        Senior Electrician
                    </Text>
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        XYZ Electrical Services, Akure, Ondo State
                    </Text>
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        May 2022 - Present
                    </Text>

                </View>
                <EmptyView height={10} />
                <View>
                    <Text style={[Textstyles.text_cmedium, { color: secondaryTextColor, }]}>
                        Senior Electrician
                    </Text>
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        XYZ Electrical Services, Akure, Ondo State
                    </Text>
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        May 2022 - Present
                    </Text>

                </View>
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Portfolio and Work Samples
                </ThemeText>
                <EmptyView height={10} />
                <View>
                    <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                        Residential Renovation-Kitchen Remodelling
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Managed a Kitchen remodeling project,includiung
                        new cabinetry, electrical work and plumbling
                        upgrade
                    </Text>
                    <EmptyView height={6} />
                    <View className="flex-row justify-around gap-x-2">
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                    </View>

                </View>
                <EmptyView height={10} />
                <View>
                    <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                        Residential Renovation-Kitchen Remodelling
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Managed a Kitchen remodeling project,includiung
                        new cabinetry, electrical work and plumbling
                        upgrade
                    </Text>
                    <EmptyView height={6} />
                    <View className="flex-row justify-around gap-x-2">
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                        <Image resizeMode="contain" source={require('../../../assets/samplework.png')} className="w-16 h-16 rounded-xl" />
                    </View>

                </View>
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Work Complete
                </ThemeText>
                <EmptyView height={10} />
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full px-3 py-2 h-36 rounded-2xl shadow-slate-300 shadow-sm justify-center">
                    <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                        Residential Renovation-Kitchen Remodelling
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Managed a Kitchen remodeling project,includiung
                        new cabinetry, electrical work and plumbling
                        upgrade
                    </Text>
                    <EmptyView height={6} />
                    <View className="flex-row justify-between">
                        <Text style={[Textstyles.text_small]} className="text-green-500">
                            N50,000
                        </Text>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                                Akure,Ondo State
                            </Text>
                        </View>


                    </View>
                    <Divider />
                    <EmptyView height={6} />
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

                </View>
                <EmptyView height={10} />
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full px-3 py-2 h-36 rounded-2xl shadow-slate-300 shadow-sm justify-center">
                    <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                        Residential Renovation-Kitchen Remodelling
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Managed a Kitchen remodeling project,includiung
                        new cabinetry, electrical work and plumbling
                        upgrade
                    </Text>
                    <EmptyView height={6} />
                    <View className="flex-row justify-between">
                        <Text style={[Textstyles.text_small]} className="text-green-500">
                            N50,000
                        </Text>
                        <View className="flex-row gap-x-2">
                            <FontAwesome6 name="location-dot" size={12} color={primaryColor} />
                            <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                                Akure,Ondo State
                            </Text>
                        </View>


                    </View>
                    <Divider />
                    <EmptyView height={6} />
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

                </View>
                <Divider />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                    Education
                </ThemeText>
                <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                    Electrical Electronic Engineering
                </Text>
                <EmptyView height={6} />
                <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                    Federal Universsity of Technology Akure
                </Text>
                <EmptyView height={6} />
                <Divider />
                <EmptyView height={10} />
                <ThemeText size={Textstyles.text_medium} >
                   Review
                </ThemeText>
                <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                       AdeSeun Olawuyi
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Good job and wel done 
                    </Text>
                    <EmptyView height={6} />
                    <RatingStar numberOfStars={4} />
                    <EmptyView height={6} />
                    
                    <Divider />
                    <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                       AdeSeun Olawuyi
                    </Text>
                    <EmptyView height={6} />
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                        Good job and wel done 
                    </Text>
                    <EmptyView height={6} />
                    <RatingStar numberOfStars={4} />
                    <EmptyView height={6} />
                    
                    <Divider />
                    <EmptyView height={10} />
                  <ThemeText size={Textstyles.text_medium} >
                   Language
                </ThemeText>
                <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                       Yoruba,Hausa
                    </Text>
                    <EmptyView height={6} />
                    
                    <Divider />
                    <EmptyView height={10} />
                  <ThemeText size={Textstyles.text_medium} >
                 Certification
                </ThemeText>
                <EmptyView height={10} />
                <Text style={[Textstyles.text_small, { color: secondaryTextColor, }]}>
                       CCNA
                    </Text>
                    <Text style={[Textstyles.text_xsma, { color: secondaryTextColor, }]}>
                       January 2013
                    </Text>

                    <EmptyView height={6} />








            </View>
        </>
    )
}