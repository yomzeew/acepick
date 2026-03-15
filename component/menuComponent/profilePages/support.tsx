import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, TouchableOpacity, Linking } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5, Entypo, MaterialIcons } from "@expo/vector-icons"
import ButtonComponent from "component/buttoncomponent"

const Support = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@acepick.com')
    }

    const handleCallSupport = () => {
        Linking.openURL('tel:+2348000000000')
    }

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/2348000000000')
    }

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Support" />
                <EmptyView height={20} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}>
                    
                    <View className="items-center">
                        <View style={{ backgroundColor: primaryColor }} className="w-20 h-20 rounded-full justify-center items-center">
                            <Entypo name="chat" color="#ffffff" size={40} />
                        </View>
                        <EmptyView height={10} />
                        <ThemeText size={Textstyles.text_medium}>How can we help you?</ThemeText>
                        <EmptyView height={5} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            We're here to help and answer any questions you might have
                        </ThemeTextsecond>
                    </View>

                    <EmptyView height={30} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Contact Us
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                            
                            <TouchableOpacity onPress={handleEmailSupport} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="email" color={primaryColor} size={20} />
                                    <View>
                                        <ThemeTextsecond size={Textstyles.text_xmedium}>Email Support</ThemeTextsecond>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>support@acepick.com</ThemeTextsecond>
                                    </View>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCallSupport} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="phone-alt" color="green" size={18} />
                                    <View>
                                        <ThemeTextsecond size={Textstyles.text_xmedium}>Call Support</ThemeTextsecond>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>+234 800 000 0000</ThemeTextsecond>
                                    </View>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleWhatsApp} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="whatsapp" color="#25D366" size={20} />
                                    <View>
                                        <ThemeTextsecond size={Textstyles.text_xmedium}>WhatsApp</ThemeTextsecond>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Chat with us on WhatsApp</ThemeTextsecond>
                                    </View>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                        </View>
                    </View>

                    <EmptyView height={20} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Working Hours
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-5">
                            <View className="flex-row justify-between items-center">
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Monday - Friday</ThemeTextsecond>
                                <ThemeText size={Textstyles.text_xsmall}>8:00 AM - 6:00 PM</ThemeText>
                            </View>
                            <EmptyView height={10} />
                            <View className="flex-row justify-between items-center">
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Saturday</ThemeTextsecond>
                                <ThemeText size={Textstyles.text_xsmall}>9:00 AM - 4:00 PM</ThemeText>
                            </View>
                            <EmptyView height={10} />
                            <View className="flex-row justify-between items-center">
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Sunday</ThemeTextsecond>
                                <ThemeText size={Textstyles.text_xsmall}>Closed</ThemeText>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </ContainerTemplate>
        </>
    )
}
export default Support
