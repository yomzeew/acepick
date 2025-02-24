import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import EmptyView from "./emptyview"
import { View } from "react-native"
import { ThemeTextsecond } from "./ThemeText"
import { AntDesign } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"

interface ListCardProps{
    content:string
    }
    const ListCard = ({content}:ListCardProps) => {
        const { theme } = useTheme()
        const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
        return (
            <>
                <EmptyView height={10} />
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-16 justify-center  rounded-2xl shadow-slate-500 shadow-sm px-5">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <ThemeTextsecond size={Textstyles.text_cmedium}>{content}</ThemeTextsecond>
                        </View>
                        <View>
                            <AntDesign color={secondaryTextColor} name="left" />
                        </View>
                    </View>
                </View>
            </>
        )
    
    }
    export default ListCard