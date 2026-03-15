import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

const TermsAndPrivacy = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const router = useRouter()

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Terms and Privacy" />
                <EmptyView height={20} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}>

                    <View className="items-center">
                        <View style={{ backgroundColor: primaryColor }} className="w-20 h-20 rounded-full justify-center items-center">
                            <MaterialIcons name="privacy-tip" color="#ffffff" size={40} />
                        </View>
                        <EmptyView height={10} />
                        <ThemeText size={Textstyles.text_medium}>Legal Information</ThemeText>
                        <EmptyView height={5} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            Read our terms and privacy policies
                        </ThemeTextsecond>
                    </View>

                    <EmptyView height={30} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Documents
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">

                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="description" color={primaryColor} size={20} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Terms of Service</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="security" color="green" size={20} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Privacy Policy</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="cookie" color="orange" size={20} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Cookie Policy</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row justify-between items-center h-20">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="gavel" color={secondaryTextColor} size={20} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>User Agreement</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>

                        </View>
                    </View>

                    <EmptyView height={20} />

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            About
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-5">
                            <View className="flex-row justify-between items-center">
                                <ThemeTextsecond size={Textstyles.text_xsmall}>App Version</ThemeTextsecond>
                                <ThemeText size={Textstyles.text_xsmall}>1.0.0</ThemeText>
                            </View>
                            <EmptyView height={10} />
                            <View className="flex-row justify-between items-center">
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Last Updated</ThemeTextsecond>
                                <ThemeText size={Textstyles.text_xsmall}>February 2026</ThemeText>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </ContainerTemplate>
        </>
    )
}
export default TermsAndPrivacy
