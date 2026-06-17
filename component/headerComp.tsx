import {View, TouchableOpacity} from 'react-native'
import { ThemeText } from 'component/ThemeText'
import BackComponent from 'component/backcomponent'
import { Textstyles } from 'static/textFontsize'
import { useTheme } from 'hooks/useTheme'
import { getColors } from 'static/color'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

interface RightButton {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

const HeaderComponent=({title, showSettings, fallback, rightButton}:{title:string | any, showSettings?: boolean, fallback?: string, rightButton?: RightButton})=>{
        const { theme } = useTheme();
        const { primaryColor, secondaryTextColor } = getColors(theme);

    return(
        <>
        <View className="pt-[60px] relative">
            <View className="absolute top-[60px] right-4 z-10">
                {showSettings && (
                    <TouchableOpacity
                        onPress={() => router.push('/(Authenticated)/(professionalLayout)/(professionalprofile)/profileeditlayout')}
                        className="p-2 rounded-full"
                        style={{ backgroundColor: primaryColor + '15' }}
                    >
                        <Ionicons name="settings-outline" size={20} color={primaryColor} />
                    </TouchableOpacity>
                )}
                {rightButton && (
                    <TouchableOpacity
                        onPress={rightButton.onPress}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: primaryColor + '15',
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 20,
                        }}
                    >
                        <Ionicons name={rightButton.icon} size={16} color={primaryColor} />
                        <ThemeText type="secondary" size={{ fontSize: 12, fontWeight: '600' }}>{rightButton.label}</ThemeText>
                    </TouchableOpacity>
                )}
            </View>
            <BackComponent bordercolor={primaryColor} textcolor={primaryColor} fallback={fallback} />
        </View>
        <View className="px-3 mt-12">
            <ThemeText type="primary" size={Textstyles.text_small}>
               {title}
            </ThemeText>
        </View>
        </>
    )
}
export default HeaderComponent