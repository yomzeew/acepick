import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, TouchableOpacity, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { FontAwesome5, MaterialIcons, AntDesign } from "@expo/vector-icons"
import ButtonComponent from "component/buttoncomponent"
import { useRouter } from "expo-router"

const SwitchToProfessional = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const router = useRouter()

    const handleSwitchToArtisan = () => {
        router.push('/professionalSelectionlayout')
    }

    const handleSwitchToDelivery = () => {
        router.push('/deliveryreglayout')
    }

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Switch to Professional" />
                <EmptyView height={20} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}>

                    <View className="items-center">
                        <View style={{ backgroundColor: primaryColor }} className="w-20 h-20 rounded-full justify-center items-center">
                            <FontAwesome5 name="briefcase" color="#ffffff" size={36} />
                        </View>
                        <EmptyView height={10} />
                        <ThemeText size={Textstyles.text_medium}>Become a Professional</ThemeText>
                        <EmptyView height={5} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            Start earning by offering your services on Acepick
                        </ThemeTextsecond>
                    </View>

                    <EmptyView height={30} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Choose Your Path
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">

                            <TouchableOpacity onPress={handleSwitchToArtisan} className="flex-row justify-between items-center h-24 border-b border-slate-400">
                                <View className="flex-row gap-x-3 items-center flex-1">
                                    <View style={{ backgroundColor: primaryColor }} className="w-12 h-12 rounded-full justify-center items-center">
                                        <FontAwesome5 name="tools" color="#ffffff" size={20} />
                                    </View>
                                    <View className="flex-1">
                                        <ThemeText size={Textstyles.text_xmedium}>Artisan / Professional</ThemeText>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Offer services like plumbing, electrical, carpentry, etc.</ThemeTextsecond>
                                    </View>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSwitchToDelivery} className="flex-row justify-between items-center h-24">
                                <View className="flex-row gap-x-3 items-center flex-1">
                                    <View style={{ backgroundColor: "#25D366" }} className="w-12 h-12 rounded-full justify-center items-center">
                                        <FontAwesome5 name="motorcycle" color="#ffffff" size={20} />
                                    </View>
                                    <View className="flex-1">
                                        <ThemeText size={Textstyles.text_xmedium}>Delivery Partner</ThemeText>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Deliver packages and earn on your own schedule</ThemeTextsecond>
                                    </View>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                        </View>
                    </View>

                    <EmptyView height={20} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Benefits
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-5">
                            
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Earn money on your own schedule</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Get access to thousands of customers</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Secure payment processing</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Build your professional profile</ThemeTextsecond>
                            </View>

                        </View>
                    </View>

                </ScrollView>
            </ContainerTemplate>
        </>
    )
}
export default SwitchToProfessional
