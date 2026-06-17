import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import RatingStar from "component/rating"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import React, { memo } from "react"
import { Image, Text } from "react-native"
import { TouchableOpacity, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { JobProps } from "types/type"

interface ProfessionalDetailsFromJobProps {
    professional: JobProps['professional'];
    showActions?: boolean;
    onProfileClick?: () => void;
}

export const ProfessionalDetailsFromJob = memo(({ professional, showActions = true, onProfileClick }: ProfessionalDetailsFromJobProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const router = useRouter()

    if (!professional || !professional.profile) {
        return null;
    }

    const { profile } = professional;
    const professionalName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const avgRating = profile.professional?.avgRating || 0;
    const numRating = profile.professional?.numRating || 0;
    const avatar = profile.avatar || '';
    const yearsOfExp = profile.professional?.yearsOfExp;
    const available = profile.professional?.available;
    const chargeFrom = profile.professional?.chargeFrom;

    // Fallback data if professional details are missing
    const fallbackData = {
        professionalName: professionalName || 'Professional',
        avgRating: avgRating || 0,
        numRating: numRating || 0,
        avatar: avatar || '',
        yearsOfExp: yearsOfExp || null,
        available: available !== undefined ? available : true,
        chargeFrom: chargeFrom || null
    };

    const userIDprofessionalId = {
        userId: profile.userId || professional.id || "", // Fallback to professional.id if userId missing
        professionalId: professional.id
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
                                    {fallbackData.professionalName}
                                </ThemeText>
                                    <View className="flex-row items-center mt-1">
                                <RatingStar numberOfStars={fallbackData.avgRating} />
                                {fallbackData.numRating > 0 && (
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginLeft: 4 }}>
                                        ({fallbackData.numRating})
                                    </Text>
                                )}
                            </View>
                            {fallbackData.yearsOfExp && (
                                <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>
                                    {fallbackData.yearsOfExp} years experience
                               </Text>
                            )}
                                    
                                </View>
                                
                                
                                    <View className='px-2 py-1 justify-end items-end'>
                                        {fallbackData.available !== undefined && (
                                             <View className={`px-2 py-1 rounded-full w-20 mb-2 items-center  ${fallbackData.available ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs ${fallbackData.available ? 'text-green-600' : 'text-red-600'}`}>
                                            {fallbackData.available ? 'Available' : 'Busy'}
                                        </Text>
                                        </View>
                                        )}
                                        {showActions && (
                <View className="flex-row gap-x-2   justify-end">
                    <TouchableOpacity
                        onPress={() => {
                            router.push(`/callchat/${JSON.stringify(userIDprofessionalId)}`);
                        }}
                        style={{ backgroundColor: "red" }}
                        className="w-8 h-8 rounded-full justify-center items-center shadow-lg"
                    >
                        <FontAwesome5 color="#ffffff" name="phone" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            router.push(`/mainchat/${JSON.stringify(userIDprofessionalId)}`);
                        }}
                        style={{ backgroundColor: primaryColor }}
                        className="w-8 h-8 rounded-full justify-center items-center shadow-lg"
                    >
                        <Ionicons name="chatbubbles-sharp" color={"#ffffff"} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onProfileClick || (() => router.push(`/clientProfileLayout?professionalId=${professional.id}`))}
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
