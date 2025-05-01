import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import { TouchableOpacity, View, ScrollView, Switch, Text } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5, Entypo, MaterialIcons, FontAwesome } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import HeaderComponent from "component/headerComp"

const ProfessionalsSettingsComp = () => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme);
    const router = useRouter()
    const professionalType="artisan"

    const handleeditnav = () => {
        router.push('/profileeditlayout')

    }
    const handlesetting = () => {
        const routes=professionalType==="artisan"?"/artisanSettingLayout":""
        router.push(routes)
    }
    const handlebillnave = () => {
        router.push('/billhistorylayout')
    }
    const handlefaqnav = () => {
        router.push('/faqlayout')
    }
    const handlewalletnav = () => {
        router.push('/walletpay')
    }
    const handleNavcorporate=()=>{
        console.log('ok')
        router.push('/corporateReglayout')
    }
    return (
        <>
            <ContainerTemplate>
                <HeaderComponent
                    title="Professional Profile Settings"
                />
                <EmptyView height={10} />
                <View className="w-full items-center px-5">
                    <TouchableOpacity onPress={handleNavcorporate} className="h-12 w-full items-center justify-center rounded-lg" style={{ backgroundColor: primaryColor }}>
                        <Text className="text-white">
                            <FontAwesome5 color="#ffffff" name="users" size="16" /> Create a Corporate Account
                        </Text>
                    </TouchableOpacity>

                </View>

                <EmptyView height={10} />
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Personal Information
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                            <TouchableOpacity onPress={handleeditnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="user" color="red" size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Edit Basic Information</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlesetting} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="bell" color={primaryColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Professional Settings</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>


                        </View>

                    </View>
                    {/* bill section */}
                    <EmptyView height={20} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Bill and Payment
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                            <TouchableOpacity onPress={handlewalletnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="wallet" color="green" size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Wallet and Payment</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlebillnave} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="book" color={primaryColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Earning history</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>


                        </View>
                    </View>
                    {/* Help section */}
                    <EmptyView height={20} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Help and Support
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                            <TouchableOpacity onPress={handlefaqnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="question" color={secondaryTextColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>FAQs</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <Entypo name="chat" color={primaryColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Support</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="privacy-tip" size={16} color="gold" />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Terms and Privacy</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>



                        </View>

                    </View>
                    {/* other setion */}
                    <EmptyView height={20} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Help and Support
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome5 name="lock" color={secondaryTextColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Change Password</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <FontAwesome name="refresh" color={primaryColor} size={16} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Switch to Professional</ThemeTextsecond>
                                </View>
                                <AntDesign name="right" size={24} color={secondaryTextColor} />
                            </TouchableOpacity>
                            <View className="flex-row justify-between items-center h-20 border-b border-slate-400">
                                <View className="flex-row gap-x-2 items-center">
                                    <MaterialIcons name="dark-mode" size={16} color={primaryColor} />
                                    <ThemeTextsecond size={Textstyles.text_xmedium}>Dark</ThemeTextsecond>
                                </View>
                                <Switch />
                            </View>



                        </View>

                    </View>
                </ScrollView>


            </ContainerTemplate>

        </>
    )
}
export default ProfessionalsSettingsComp