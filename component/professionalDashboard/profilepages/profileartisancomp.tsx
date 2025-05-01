import { FontAwesome5 } from "@expo/vector-icons"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { UserDetail } from "component/dashboardComponent/userdetails"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const ArtisanSettingsComp = () => {
    const { theme } = useTheme()
    const { selectioncardColor } = getColors(theme)
    const router=useRouter()
    return (
        <>
            <ContainerTemplate>
                <HeaderComponent
                    title="Professional Profile Settings"
                />
                <EmptyView height={10} />
                <UserDetail />
                <EmptyView height={30} />
                <View style={{ backgroundColor: selectioncardColor, }} className="w-full h-auto justify-center py-3 px-3 flex-1">

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                                Overview
                            </ThemeText>
                            <TouchableOpacity onPress={()=>{router.push('/overViewLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={10} />
                        <Divider />
                        <EmptyView height={10} />
                        <View className="w-full">
                            <ThemeText size={Textstyles.text_cmedium}>About</ThemeText>

                        </View>
                        <View className="w-full">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                I am an experienced electrician with a passion for safe
                                and efficient electrical solutions. With [number of years]
                                years in the field, I take pride in delivering top-quality
                                workmanship for residential and commercial projects.
                                My focus is on adhering to industry standards and ensuring
                                your electrical systems run flawlessly. From installations
                                to repairs, count on me to brighten up your spaces with care
                                and dedication. Safety is my priority, and I'm committed to
                                providing worry-free solutions for all your electrical
                                needs. Let me be your guiding light when it comes to electrifying your spaces.
                            </ThemeTextsecond>

                        </View>
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                                Professions
                            </ThemeText>
                            <TouchableOpacity onPress={()=>{router.push('/professionalLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={10} />
                        <Divider />
                        <EmptyView height={10} />
                        <View className="w-full px-3">
                            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-24 justify-between items-center py-3 px-3 shadow-sm shadow-black flex-row rounded-xl">
                                <View className="">
                                    <Text className="text-left">
                                        <ThemeText size={Textstyles.text_small}>
                                            Electrician
                                        </ThemeText>
                                    </Text>
                                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                                        <FontAwesome5 name="star" color="yellow" /> 3years
                                    </ThemeTextsecond>
                                </View>
                                <View className="items-end">
                                    <Text className="text-right">
                                        <ThemeText size={Textstyles.text_small}>
                                            Construction and Building
                                        </ThemeText>
                                    </Text>
                                    <TouchableOpacity className="w-24 py-2 px-3 bg-slate-400 rounded-xl items-center justify-center">
                                        <Text className="text-slate-600">Default</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <EmptyView height={20} />
                            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-24 justify-between items-center py-3 px-3 shadow-sm shadow-black flex-row rounded-xl">
                                <View className="">
                                    <Text className="text-left">
                                        <ThemeText size={Textstyles.text_small}>
                                            Plumber
                                        </ThemeText>
                                    </Text>
                                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                                        <FontAwesome5 name="star" color="yellow" /> 3years
                                    </ThemeTextsecond>
                                </View>
                                <View className="items-end">
                                    <Text className="text-right">
                                        <ThemeText size={Textstyles.text_small}>
                                            Construction and Building
                                        </ThemeText>
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <EmptyView height={20} />
                        <Divider />
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                                Work Experience
                            </ThemeText>
                            <TouchableOpacity  onPress={()=>{router.push('/workExpLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <WorkExperience />
                        <EmptyView height={20} />
                        <Divider />
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                               Portfolio
                            </ThemeText>
                            <TouchableOpacity  onPress={()=>{router.push('/portfolioLayoutEdit')}}  className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <Portfolio/>
                        <EmptyView height={20} />
                        <Portfolio/>
                        <EmptyView height={20} />
                        <Divider />
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                               Education
                            </ThemeText>
                            <TouchableOpacity onPress={()=>{router.push('/educationLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <View>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                Federal University of Technology Akure, Ondo State
                            </ThemeTextsecond>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                               BTech Electrical and Electronics Engineering
                            </ThemeTextsecond>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                               May 2020-June 2025
                            </ThemeTextsecond>
                        </View>
                        <EmptyView height={20} />
                        <Divider />
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                              Language Spoken
                            </ThemeText>
                            <TouchableOpacity  onPress={()=>{router.push('/languageLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <View>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                              Yoruba, English
                            </ThemeTextsecond>
                        </View>
                        <EmptyView height={20} />
                        <Divider />
                        <EmptyView height={20} />
                        <View className="flex-row justify-between items-center w-full">
                            <ThemeText size={Textstyles.text_medium}>
                               Certification
                            </ThemeText>
                            <TouchableOpacity  onPress={()=>{router.push('/certificationLayoutEdit')}} className="px-2 py-2 bg-green-500 w-24 items-center justify-center rounded-xl" >
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <View>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                Electrical Practitional
                            </ThemeTextsecond>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                            XYZ Electrician Akure, Ondo State
                            </ThemeTextsecond>
                        </View>

                    </ScrollView>

                </View>
            </ContainerTemplate>
        </>
    )
}
export default ArtisanSettingsComp

const WorkExperience = () => {
    return (
        <>


            <View className="w-full">
                <ThemeTextsecond size={Textstyles.text_small}>
                    Senior Electrician
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    XYZ Electrician Akure, Ondo State
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    May 2020-Present
                </ThemeTextsecond>
            </View>
            <EmptyView height={20} />
            <View className="w-full">
                <ThemeTextsecond size={Textstyles.text_small}>
                    Senior Electrician
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    XYZ Electrician Akure, Ondo State
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    May 2020-Present
                </ThemeTextsecond>
            </View>



        </>
    )
}
const Portfolio=()=>{
    return(
        <>
        <View className="w-full">
            <ThemeText size={Textstyles.text_small}>
                Resisdential Renovation---Kitchen Remodelling
            </ThemeText>
            <ThemeTextsecond size={Textstyles.text_xsmall}>
                Managed a Kitchen remodeling project including
                new cabinetry electrical work and plumbling upgrade
            </ThemeTextsecond>
            <EmptyView height={10}/>
            <View className="w-full flex-row justify-between">
                <View>
                   <ThemeText size={Textstyles.text_xsmall}>
                        <FontAwesome5 name="clock"/>
                        <Text> </Text>
                        3 months
                    </ThemeText>

                </View>
                <View>
                <ThemeTextsecond size={Textstyles.text_xsmall}>
                     May 7,2022
                    </ThemeTextsecond>
                    
                </View>

            </View>
            <EmptyView height={10}/>
            <GalleryView/>

        </View>
        </>
    )
}
const GalleryView=()=>{
    return(
        <>
         <View className="flex-row gap-x-2 w-full items-center justify-center">
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                       
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                      
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        
                    </View>


                </View>
        </>
    )
}