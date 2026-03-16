import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { FontAwesome5, MaterialIcons, AntDesign } from "@expo/vector-icons"
import ButtonComponent from "component/buttoncomponent"
import { useRouter } from "expo-router"
import { useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { AlertMessageBanner } from "component/AlertMessageBanner"

const SwitchToProfessional = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    
    const user = useSelector((state: RootState) => state.auth.user)
    const currentRole = user?.role

    const showConfirmationDialog = (type: 'artisan' | 'delivery') => {
        const title = type === 'artisan' ? 'Become an Artisan/Professional' : 'Become a Delivery Partner'
        const message = type === 'artisan' 
            ? 'Are you ready to start offering your professional services? You\'ll need to complete verification and set up your professional profile.'
            : 'Are you ready to start delivering packages? You\'ll need to complete verification and set up your delivery profile.'

        Alert.alert(
            title,
            message,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Continue',
                    onPress: () => handleProfessionalSwitch(type),
                },
            ]
        )
    }

    const handleProfessionalSwitch = async (type: 'artisan' | 'delivery') => {
        setIsProcessing(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
            // Check if user is already a professional
            if (currentRole === 'professional' || currentRole === 'delivery') {
                setErrorMessage('You are already registered as a professional. Contact support if you want to change your professional type.')
                setIsProcessing(false)
                return
            }

            // Simulate API call to initiate professional switch
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            setSuccessMessage('Professional registration initiated! Redirecting to registration...')
            
            // Navigate to appropriate registration flow
            setTimeout(() => {
                if (type === 'artisan') {
                    router.push('/professionalSelectionlayout')
                } else {
                    router.push('/deliveryreglayout')
                }
            }, 2000)

        } catch (error) {
            setErrorMessage('Failed to initiate professional switch. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSwitchToArtisan = () => {
        showConfirmationDialog('artisan')
    }

    const handleSwitchToDelivery = () => {
        showConfirmationDialog('delivery')
    }

    return (
        <>
            {successMessage && (
                <AlertMessageBanner type="success" message={successMessage} />
            )}
            {errorMessage && (
                <AlertMessageBanner type="error" message={errorMessage} />
            )}
            
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
                            Start earning by offering your services on StaffSync
                        </ThemeTextsecond>
                    </View>

                    <EmptyView height={30} />

                    {/* Current Status */}
                    {currentRole && (
                        <View>
                            <ThemeTextsecond size={Textstyles.text_cmedium}>
                                Current Status
                            </ThemeTextsecond>
                            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                                className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-4 mb-4">
                                <View className="flex-row items-center gap-x-3">
                                    <FontAwesome5 
                                        name={currentRole === 'professional' ? 'user-tie' : currentRole === 'delivery' ? 'motorcycle' : 'user'} 
                                        color={primaryColor} 
                                        size={20} 
                                    />
                                    <View>
                                        <ThemeText size={Textstyles.text_xmedium}>
                                            {currentRole === 'professional' ? 'Professional Account' : 
                                             currentRole === 'delivery' ? 'Delivery Partner' : 'Client Account'}
                                        </ThemeText>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                                            {currentRole === 'client' ? 'Ready to upgrade to professional' : 'Already a professional user'}
                                        </ThemeTextsecond>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Choose Your Path
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">

                            <TouchableOpacity 
                                onPress={handleSwitchToArtisan} 
                                disabled={isProcessing}
                                className={`flex-row justify-between items-center h-24 border-b border-slate-400 ${
                                    isProcessing ? 'opacity-50' : ''
                                }`}
                            >
                                <View className="flex-row gap-x-3 items-center flex-1">
                                    <View style={{ backgroundColor: primaryColor }} className="w-12 h-12 rounded-full justify-center items-center">
                                        <FontAwesome5 name="tools" color="#ffffff" size={20} />
                                    </View>
                                    <View className="flex-1">
                                        <ThemeText size={Textstyles.text_xmedium}>Artisan / Professional</ThemeText>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Offer services like plumbing, electrical, carpentry, etc.</ThemeTextsecond>
                                    </View>
                                </View>
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={primaryColor} />
                                ) : (
                                    <AntDesign name="right" size={24} color={secondaryTextColor} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={handleSwitchToDelivery} 
                                disabled={isProcessing}
                                className={`flex-row justify-between items-center h-24 ${
                                    isProcessing ? 'opacity-50' : ''
                                }`}
                            >
                                <View className="flex-row gap-x-3 items-center flex-1">
                                    <View style={{ backgroundColor: "#25D366" }} className="w-12 h-12 rounded-full justify-center items-center">
                                        <FontAwesome5 name="motorcycle" color="#ffffff" size={20} />
                                    </View>
                                    <View className="flex-1">
                                        <ThemeText size={Textstyles.text_xmedium}>Delivery Partner</ThemeText>
                                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Deliver packages and earn on your own schedule</ThemeTextsecond>
                                    </View>
                                </View>
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color={primaryColor} />
                                ) : (
                                    <AntDesign name="right" size={24} color={secondaryTextColor} />
                                )}
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
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Flexible working hours</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Professional development resources</ThemeTextsecond>
                            </View>

                        </View>
                    </View>

                    <EmptyView height={20} />

                    {/* Requirements Section */}
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>
                            Requirements
                        </ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-5">
                            
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Valid identification documents</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Professional certifications (for artisans)</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Smartphone with internet connection</ThemeTextsecond>
                            </View>
                            <View className="flex-row items-center gap-x-3 py-2">
                                <AntDesign name="checkcircle" color="green" size={18} />
                                <ThemeTextsecond size={Textstyles.text_xsmall}>Bank account for payments</ThemeTextsecond>
                            </View>

                        </View>
                    </View>
                </ScrollView>
            </ContainerTemplate>
        </>
    )
}
export default SwitchToProfessional
