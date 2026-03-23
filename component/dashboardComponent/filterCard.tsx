import { View, TextInput, TouchableOpacity, Keyboard } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { getColors } from "../../static/color"
import { ThemeText } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5 } from "@expo/vector-icons"

interface FilterCardProps {
    showprofession: boolean;
    setshowprofession: (value: boolean) => void;
    professionalValue: string;
    setProfessionValue: (value: string) => void;
}

const FilterCard = ({ showprofession, setshowprofession, professionalValue, setProfessionValue }: FilterCardProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, secondaryTextColor, primaryColor } = getColors(theme)

    const handleSubmit = () => {
        setshowprofession(!showprofession)
        Keyboard.dismiss()
    }

    return (
        <View
            style={{
                backgroundColor: selectioncardColor,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            }}
            className="w-full rounded-2xl px-4 py-4"
        >
            <ThemeText size={Textstyles.text_xmedium} type="secondary">
                Find a Professional
            </ThemeText>

            <View className="relative w-full mt-3">
                <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10">
                    <FontAwesome5 name="search" size={14} color={theme === 'dark' ? '#9CA3AF' : '#94a3b8'} />
                </View>
                <TextInput
                    placeholder="Search electrician, plumber..."
                    placeholderTextColor={theme === 'dark' ? '#6B7280' : '#94a3b8'}
                    style={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#f1f5f9',
                        color: secondaryTextColor,
                        fontFamily: 'TTFirsNeue',
                        fontSize: 14,
                    }}
                    className="rounded-xl h-12 pl-10 pr-14 w-full"
                    value={professionalValue}
                    onChangeText={(text) => setProfessionValue(text)}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="search"
                />

                <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    style={{ backgroundColor: primaryColor }}
                    className="h-10 w-10 absolute right-1 top-1 items-center justify-center rounded-lg"
                >
                    <FontAwesome5 color="#ffffff" size={16} name="arrow-right" />
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default FilterCard