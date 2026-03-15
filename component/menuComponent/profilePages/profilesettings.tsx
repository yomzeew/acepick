import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { TouchableOpacity, View,ScrollView, Switch } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5,Entypo,MaterialIcons, FontAwesome } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import ButtonComponent from "component/buttoncomponent"

const ProfileSetting=()=>{
    const { theme, toggleTheme } = useTheme();
    const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme);
    const router = useRouter();
    const handleeditnav=()=>{
        router.push('/profileeditlayout')

    }
    const handlenotificationapp=()=>{
        router.push('/notificationapplayout')
    }
    const handlebillnave=()=>{
        router.push('/billhistorylayout')
    }
    const handlefaqnav=()=>{
        router.push('/faqlayout')
    }
    const handlewalletnav=()=>{
        router.push('/walletpay')
    }
    const handlechangePassword=()=>{
        router.push('/passwordchangelayout')
    }
    const handleresetPin=()=>{
        router.push('/resetpinlayout')
    }
    const handlesupportnav=()=>{
        router.push('/supportlayout')
    }
    const handletermsandprivacynav=()=>{
        router.push('/termsandprivacylayout')
    }
    const handleswitchtoprofessionalnav=()=>{
        router.push('/switchtoprofessionallayout')
    }
    return(
        <>
        <ContainerTemplate>
            <HeaderComponent
            title="Profile Settings"
            />
            <EmptyView height={10}/>
            <ScrollView contentContainerStyle={{paddingBottom:20}}>
            {/* Personal Information */}
            <EmptyView height={20}/>
            <View>
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Personal Information
            </ThemeTextsecond>
            <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                <TouchableOpacity onPress={handleeditnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="user-edit" color={primaryColor} size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Edit Profile</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Update your personal information
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleswitchtoprofessionalnav} className="flex-row justify-between items-center h-20">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="user-tie" color="#10b981" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Switch to Professional</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Access professional features
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
            </View>
            </View>

            {/* Preferences */}
            <EmptyView height={20}/>
            <View>
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Preferences
            </ThemeTextsecond>
            <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                <TouchableOpacity onPress={handlenotificationapp} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="bell" color="#f59e0b" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Notifications</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Manage app notifications
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <View className="flex-row justify-between items-center h-20">
                    <View className="flex-row gap-x-3 items-center">
                    <MaterialIcons name="dark-mode" size={16} color="#8b5cf6" />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>
                            {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Change app appearance
                        </ThemeTextsecond>
                    </View>
                    </View>
                <Switch
                    trackColor={{ false: "#767577", true: primaryColor }}
                    thumbColor={theme === "dark" ? "#f4f3f4" : "#fff"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleTheme}
                    value={theme === "dark"}
                />
                </View>
            </View>
            </View>

            {/* Security */}
            <EmptyView height={20}/>
            <View>
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Security
            </ThemeTextsecond>
            <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                <TouchableOpacity onPress={handlechangePassword} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="lock" color="#ef4444" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Change Password</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Update your password
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleresetPin} className="flex-row justify-between items-center h-20">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="key" color="#f97316" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Transaction PIN</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Reset your transaction PIN
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
            </View>
            </View>

            {/* Payment & Billing */}
            <EmptyView height={20}/>
            <View>
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Payment & Billing
            </ThemeTextsecond>
            <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                <TouchableOpacity onPress={handlewalletnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="wallet" color="#10b981" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Wallet</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Manage payment methods
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlebillnave} className="flex-row justify-between items-center h-20">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="file-invoice" color="#3b82f6" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Billing History</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            View transaction history
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
            </View>
            </View>

            {/* Support */}
            <EmptyView height={20}/>
            <View>
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Support
            </ThemeTextsecond>
            <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
                <TouchableOpacity onPress={handlefaqnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="question-circle" color="#6b7280" size={16}/>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>FAQs</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Frequently asked questions
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlesupportnav} className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="headset" color="#8b5cf6" size={16} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Customer Support</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Get help from our team
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handletermsandprivacynav} className="flex-row justify-between items-center h-20">
                    <View className="flex-row gap-x-3 items-center">
                    <FontAwesome5 name="shield-alt" color="#06b6d4" size={16} />
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xmedium}>Terms & Privacy</ThemeTextsecond>
                        <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '80' }}>
                            Legal information
                        </ThemeTextsecond>
                    </View>
                    </View>
                <AntDesign name="right" size={20} color={secondaryTextColor} />
                </TouchableOpacity>
            </View>
            </View>

            {/* Account Actions */}
            <EmptyView height={30}/>
            <View className="w-full">
                <ButtonComponent 
                    color="#ef4444" 
                    text="Logout" 
                    textcolor="#ffffff" 
                    onPress={() => { router.replace("/loginscreen") }}
                />
                <EmptyView height={10} />
                <ThemeTextsecond size={Textstyles.text_xxxsmall} style={{ color: secondaryTextColor + '60' }} className="text-center">
                    Version 1.0.0
                </ThemeTextsecond>
            </View>
            </ScrollView>
            
           
        </ContainerTemplate>

        </>
    )
}
export default ProfileSetting