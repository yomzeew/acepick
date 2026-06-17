import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import React, { memo } from "react"
import { Image, Text } from "react-native"
import { TouchableOpacity, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { JobProps } from "types/type"

interface ClientDetailsFromJobProps {
    client: JobProps['client'];
    showActions?: boolean;
    onProfileClick?: () => void;
}

export const ClientDetailsFromJob = memo(({ client, showActions = true, onProfileClick }: ClientDetailsFromJobProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const router = useRouter()

    if (!client || !client.profile) {
        return null;
    }

    const { profile } = client;
    const clientName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const avatar = profile.avatar || '';

    // Fallback data if client details are missing
    const fallbackData = {
        clientName: clientName || 'Client',
        email: client?.email || '',
        phone: client?.phone || '',
        avatar: avatar || ''
    };

    const userIDclientId = {
        userId: client.id || "",
        clientId: client.id
    };

    return (
        <>
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
            >
                <View className="w-full flex-row justify-between items-center">
                    <View className="flex-row gap-x-2 items-center flex-1">
                        <View className="w-12 h-12 bg-slate-200 rounded-full">
                            {fallbackData.avatar ? (
                                <Image 
                                    resizeMode="contain" 
                                    className="w-12 h-12 rounded-full" 
                                    source={{ uri: fallbackData.avatar }} 
                                />
                            ) : (
                                <View className="w-12 h-12 rounded-full justify-center items-center">
                                    <FontAwesome5 name="user" size={20} color={secondaryTextColor} />
                                </View>
                            )}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <ThemeText size={Textstyles.text_small}>
                                        {fallbackData.clientName}
                                    </ThemeText>
                                    <View className="flex-row items-center mt-1">
                                        <View className="px-2 py-1 rounded-full bg-blue-100">
                                            <Text className="text-xs text-blue-600">Client</Text>
                                        </View>
                                    </View>
                                    {fallbackData.email && (
                                        <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>
                                            {fallbackData.email}
                                        </Text>
                                    )}
                                    {fallbackData.phone && (
                                        <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>
                                            {fallbackData.phone}
                                        </Text>
                                    )}
                                </View>
                                
                                <View className='px-2 py-1 justify-end items-end'>
                                    <View className={`px-2 py-1 rounded-full w-20 mb-2 items-center bg-green-100`}>
                                        <Text className="text-xs text-green-600">Available</Text>
                                    </View>
                                    {showActions && (
                                        <View className="flex-row gap-x-2 justify-end">
                                            <TouchableOpacity
                                                onPress={() => {
                                                    router.push(`/callchat/${JSON.stringify(userIDclientId)}`);
                                                }}
                                                style={{ backgroundColor: primaryColor }}
                                                className="w-8 h-8 rounded-full justify-center items-center shadow-lg"
                                            >
                                                <FontAwesome5 color="#ffffff" name="phone" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    router.push(`/mainchat/${JSON.stringify(userIDclientId)}`);
                                                }}
                                                style={{ backgroundColor: primaryColor }}
                                                className="w-8 h-8 rounded-full justify-center items-center shadow-lg"
                                            >
                                                <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={onProfileClick || (() => router.push(`/clientProfileLayout?clientId=${client.id}`))}
                                                style={{ borderColor: primaryColor, borderWidth: 1 }}
                                                className="w-8 h-8 rounded-full justify-center items-center bg-white shadow-lg"
                                            >
                                                <FontAwesome5 color={primaryColor} name="user" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
});
