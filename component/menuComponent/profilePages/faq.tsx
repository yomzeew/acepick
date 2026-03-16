import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Switch, View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { TextInput } from "react-native"
import InputComponent from "component/controls/textinput"
import { AntDesign, FontAwesome5 } from "@expo/vector-icons"
import ListCard from "component/listcard"
import { useState } from "react"

const FAQ = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    
    const [expandedItems, setExpandedItems] = useState<number[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    
    const faqData = [
        {
            id: 1,
            category: "Account",
            question: "How do I create an account?",
            answer: "To create an account, click on the 'Sign Up' button on the home screen. Fill in your personal information, verify your email and phone number, and follow the onboarding process."
        },
        {
            id: 2,
            category: "Account",
            question: "How do I reset my password?",
            answer: "Go to the login screen and click 'Forgot Password'. Enter your registered email address, and we'll send you instructions to reset your password."
        },
        {
            id: 3,
            category: "Payments",
            question: "How do I add money to my wallet?",
            answer: "Navigate to the Wallet section and click 'Fund Wallet'. Choose your preferred payment method, enter the amount, and follow the payment instructions."
        },
        {
            id: 4,
            category: "Payments",
            question: "How do I withdraw money?",
            answer: "Go to Wallet > Withdraw Money. Enter your bank details, specify the amount, and confirm the withdrawal. Funds typically arrive within 1-3 business days."
        },
        {
            id: 5,
            category: "Services",
            question: "How do I book a service?",
            answer: "Browse available services in the marketplace, select the one you need, choose a professional, and confirm your booking. You'll receive notifications about your service status."
        },
        {
            id: 6,
            category: "Services",
            question: "Can I cancel a booking?",
            answer: "Yes, you can cancel bookings up to 2 hours before the scheduled time without penalty. Late cancellations may incur a fee."
        },
        {
            id: 7,
            category: "Verification",
            question: "Why do I need to verify my identity?",
            answer: "Identity verification ensures the safety and security of all users. It helps prevent fraud and builds trust in the community."
        },
        {
            id: 8,
            category: "Verification",
            question: "What documents do I need for verification?",
            answer: "You'll need a valid government-issued ID, proof of address, and for professionals, relevant professional certifications or licenses."
        },
        {
            id: 9,
            category: "Technical",
            question: "How do I report a technical issue?",
            answer: "You can report issues through the Help section in the app, email support@staffsync.com, or use the in-app chat support feature."
        },
        {
            id: 10,
            category: "Technical",
            question: "Is my data secure?",
            answer: "Yes, we use industry-standard encryption and security measures to protect your personal and financial information. Your data is never shared without your consent."
        },
        {
            id: 11,
            category: "Professionals",
            question: "How do I become a service provider?",
            answer: "Sign up as a professional, complete your profile, upload your certifications, and pass our verification process. Once approved, you can start offering services."
        },
        {
            id: 12,
            category: "Professionals",
            question: "How and when do I get paid?",
            answer: "Payments are processed within 24 hours after service completion. Funds are transferred to your registered bank account or wallet."
        }
    ]
    
    const toggleExpand = (id: number) => {
        setExpandedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }
    
    const filteredFAQs = faqData.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    const categories = [...new Set(faqData.map(item => item.category))]
    
    const handleEmailSupport = async () => {
        try {
            const email = 'support@acepick.com'
            const subject = encodeURIComponent('Support Request - StaffSync')
            const body = encodeURIComponent('Please describe your issue or question here...')
            await Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`)
        } catch (error) {
            console.error('Email error:', error)
        }
    }
    
    const handleWhatsAppSupport = async () => {
        try {
            const phoneNumber = '2348000000000'
            const message = encodeURIComponent('Hello! I need help with StaffSync.')
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
            
            const canOpen = await Linking.canOpenURL(whatsappUrl)
            if (canOpen) {
                await Linking.openURL(whatsappUrl)
            } else {
                Alert.alert(
                    "WhatsApp Not Available",
                    "WhatsApp is not installed on your device. Please install WhatsApp or contact us via email.",
                    [{ text: "OK" }]
                )
            }
        } catch (error) {
            console.error('WhatsApp error:', error)
            Alert.alert(
                "Error",
                "Unable to open WhatsApp. Please try again or contact us via email.",
                [{ text: "OK" }]
            )
        }
    }
    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="FAQs" />
                <EmptyView height={10} />
                
                {/* Search Bar */}
                <View className="px-3 mb-4">
                    <InputComponent 
                        color={primaryColor}
                        placeholder="Search FAQs..."
                        placeholdercolor={secondaryTextColor}
                        value={searchQuery}
                        onChange={setSearchQuery}
                        prefix={true}
                        icon={<FontAwesome5 name="search" size={16} />}
                    />
                </View>
                
                {/* Category Filter */}
                <View className="px-3 mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                                style={{
                                    backgroundColor: searchQuery === "" ? primaryColor : "transparent",
                                    borderColor: primaryColor,
                                    borderWidth: 1
                                }}
                                className="px-3 py-1 rounded-full items-center justify-center"
                            >
                                <Text style={{ color: searchQuery === "" ? "white" : primaryColor }} className="text-sm">
                                    All
                                </Text>
                            </TouchableOpacity>
                            {categories.map(category => (
                                <TouchableOpacity
                                    key={category}
                                    onPress={() => setSearchQuery(category)}
                                    style={{
                                        backgroundColor: searchQuery === category ? primaryColor : "transparent",
                                        borderColor: primaryColor,
                                        borderWidth: 1
                                    }}
                                    className="px-3 py-1 rounded-full items-center justify-center"
                                >
                                    <Text style={{ color: searchQuery === category ? "white" : primaryColor }} className="text-sm">
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
                
                {/* FAQ Items */}
                <View className="flex-1 px-3">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {filteredFAQs.length === 0 ? (
                            <View className="items-center justify-center py-10">
                                <FontAwesome5 name="question-circle" size={48} color={secondaryTextColor} />
                                <Text className="text-gray-500 mt-4">No FAQs found</Text>
                            </View>
                        ) : (
                            filteredFAQs.map(item => (
                                <View key={item.id} className="mb-3">
                                    <TouchableOpacity
                                        onPress={() => toggleExpand(item.id)}
                                        style={{ backgroundColor: selectioncardColor }}
                                        className="p-4 rounded-xl"
                                    >
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1 mr-2">
                                                <View className="flex-row items-center mb-2">
                                                    <Text style={{ color: primaryColor }} className="text-xs font-semibold mr-2">
                                                        {item.category}
                                                    </Text>
                                                </View>
                                                <Text className="text-sm font-medium text-gray-800">
                                                    {item.question}
                                                </Text>
                                            </View>
                                            <FontAwesome5 
                                                name={expandedItems.includes(item.id) ? "chevron-up" : "chevron-down"} 
                                                size={16} 
                                                color={secondaryTextColor}
                                            />
                                        </View>
                                        
                                        {expandedItems.includes(item.id) && (
                                            <View className="mt-3 pt-3 border-t border-gray-200">
                                                <Text className="text-sm text-gray-600 leading-relaxed">
                                                    {item.answer}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
                
                {/* Contact Support */}
                <View className="px-3 pb-4">
                    <TouchableOpacity
                        onPress={() => Alert.alert(
                            "Contact Support",
                            "How would you like to contact us?",
                            [
                                { text: "Email", onPress: handleEmailSupport },
                                { text: "WhatsApp", onPress: handleWhatsAppSupport },
                                { text: "Cancel", style: "cancel" }
                            ]
                        )}
                        style={{ backgroundColor: primaryColor }}
                        className="p-3 rounded-xl items-center justify-center"
                    >
                        <Text className="text-white font-medium">Still need help? Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ContainerTemplate>
        </>
    )
}
export default FAQ
