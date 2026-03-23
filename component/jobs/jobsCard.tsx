import { ThemeText } from "component/ThemeText"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { View, Text, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

interface Props {
    count?: number;
    onPress?: () => void;
}

const JobCard = ({ count = 0, onPress }: Props) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, borderColor } = getColors(theme)

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1, elevation: 2 }}
            className="w-full flex-row items-center justify-between rounded-2xl px-4 py-4"
        >
            <View className="flex-row items-center" style={{ gap: 12 }}>
                <View
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: primaryColor + '15' }}
                >
                    <Ionicons name="briefcase-outline" size={22} color={primaryColor} />
                </View>
                <View>
                    <ThemeText size={Textstyles.text_small}>My Jobs</ThemeText>
                    <Text style={{ color: secondaryTextColor, fontSize: 11, marginTop: 1 }}>
                        {count > 0 ? `${count} active` : 'View all jobs'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center" style={{ gap: 8 }}>
                {count > 0 && (
                    <View
                        className="min-w-[28px] h-7 rounded-full items-center justify-center px-2"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{count}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={secondaryTextColor} />
            </View>
        </TouchableOpacity>
    )
}
export default JobCard