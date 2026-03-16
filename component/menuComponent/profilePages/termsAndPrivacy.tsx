import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, TouchableOpacity, Alert, Linking, Modal, Text } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"

const TermsAndPrivacy = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const router = useRouter()
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    const documents = [
        {
            id: 'terms',
            title: 'Terms of Service',
            icon: 'description',
            iconColor: primaryColor,
            content: `# Terms of Service

## 1. Acceptance of Terms
By accessing and using StaffSync, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily download one copy of the materials on StaffSync for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on StaffSync are provided on an 'as is' basis. StaffSync makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 4. Limitations
In no event shall StaffSync or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on StaffSync.

## 5. Revisions and Errata
The materials appearing on StaffSync could include technical, typographical, or photographic errors. StaffSync does not warrant that any of the materials on its website are accurate, complete, or current.

## 6. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`
        },
        {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: 'security',
            iconColor: 'green',
            content: `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us.

## 2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

## 3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## 4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Your Rights
You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.

## 6. Children's Privacy
Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.

## 7. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.`
        },
        {
            id: 'cookies',
            title: 'Cookie Policy',
            icon: 'cookie',
            iconColor: 'orange',
            content: `# Cookie Policy

## 1. What Are Cookies
Cookies are small text files that are placed on your device when you visit our website or use our services.

## 2. How We Use Cookies
We use cookies to:
- Remember your preferences
- Understand how you use our services
- Provide personalized content
- Improve our services

## 3. Types of Cookies We Use
- Essential cookies: Required for our services to function
- Performance cookies: Help us understand how our services perform
- Functional cookies: Enable personalized features
- Marketing cookies: Used to deliver relevant advertisements

## 4. Managing Cookies
You can control and/or delete cookies as you wish. You can delete all cookies that are already on your device and you can set most browsers to prevent them from being placed.

## 5. Third-Party Cookies
Some cookies are placed by third-party services that appear on our pages. We use these services to provide analytics and advertising.`
        },
        {
            id: 'agreement',
            title: 'User Agreement',
            icon: 'gavel',
            iconColor: secondaryTextColor,
            content: `# User Agreement

## 1. Account Registration
You must provide accurate, complete, and current information when registering for an account.

## 2. Account Security
You are responsible for maintaining the confidentiality of your account credentials.

## 3. Acceptable Use
You agree not to use our services for any unlawful purposes or in any way that could damage, disable, or impair our services.

## 4. Intellectual Property
All content, features, and functionality of our services are owned by StaffSync and are protected by international copyright, trademark, and other intellectual property laws.

## 5. Termination
We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

## 6. Dispute Resolution
Any disputes arising from your use of our services will be resolved through binding arbitration in accordance with the laws of Nigeria.`
        }
    ]

    const handleDocumentPress = (documentId: string) => {
        setSelectedDocument(documentId)
        setModalVisible(true)
    }

    const closeModal = () => {
        setModalVisible(false)
        setSelectedDocument(null)
    }

    const downloadDocument = async (documentId: string) => {
        try {
            // In a real app, this would download or open the actual document
            Alert.alert(
                "Download Document",
                "This would download the PDF version of the document.",
                [{ text: "OK" }]
            )
        } catch (error) {
            console.error('Download error:', error)
            Alert.alert(
                "Error",
                "Unable to download document. Please try again.",
                [{ text: "OK" }]
            )
        }
    }

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

                            {documents.map((doc, index) => (
                                <TouchableOpacity 
                                    key={doc.id}
                                    onPress={() => handleDocumentPress(doc.id)}
                                    className={`flex-row justify-between items-center h-20 ${
                                        index < documents.length - 1 ? 'border-b border-slate-400' : ''
                                    }`}
                                >
                                    <View className="flex-row gap-x-2 items-center">
                                        <MaterialIcons 
                                            name={doc.icon as any} 
                                            color={doc.iconColor as any} 
                                            size={20} 
                                        />
                                        <ThemeTextsecond size={Textstyles.text_xmedium}>
                                            {doc.title}
                                        </ThemeTextsecond>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <TouchableOpacity
                                            onPress={() => downloadDocument(doc.id)}
                                            className="p-2"
                                        >
                                            <FontAwesome5 name="download" size={16} color={secondaryTextColor} />
                                        </TouchableOpacity>
                                        <AntDesign name="right" size={24} color={secondaryTextColor} />
                                    </View>
                                </TouchableOpacity>
                            ))}

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
                
                {/* Document Viewer Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View className="flex-1 bg-white">
                        {/* Header */}
                        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                            <TouchableOpacity onPress={closeModal}>
                                <AntDesign name="close" size={24} color={primaryColor} />
                            </TouchableOpacity>
                            <ThemeText size={Textstyles.text_medium}>
                                {selectedDocument && documents.find(d => d.id === selectedDocument)?.title}
                            </ThemeText>
                            <TouchableOpacity 
                                onPress={() => selectedDocument && downloadDocument(selectedDocument)}
                            >
                                <FontAwesome5 name="download" size={20} color={primaryColor} />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Document Content */}
                        <ScrollView className="flex-1 p-4">
                            {selectedDocument && (
                                <View>
                                    {documents.find(d => d.id === selectedDocument)?.content.split('\n').map((line, index) => {
                                        if (line.startsWith('# ')) {
                                            return (
                                                <Text key={index} className="text-xl font-bold mb-4 mt-6">
                                                    {line.replace('# ', '')}
                                                </Text>
                                            )
                                        } else if (line.startsWith('## ')) {
                                            return (
                                                <Text key={index} className="text-lg font-semibold mb-3 mt-4">
                                                    {line.replace('## ', '')}
                                                </Text>
                                            )
                                        } else if (line.startsWith('- ')) {
                                            return (
                                                <Text key={index} className="text-base mb-2 ml-4">
                                                    • {line.replace('- ', '')}
                                                </Text>
                                            )
                                        } else if (line.trim()) {
                                            return (
                                                <Text key={index} className="text-base mb-3 leading-relaxed">
                                                    {line}
                                                </Text>
                                            )
                                        }
                                        return <View key={index} className="h-2" />
                                    })}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </Modal>
            </ContainerTemplate>
        </>
    )
}
export default TermsAndPrivacy
