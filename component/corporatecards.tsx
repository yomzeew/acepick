import { useTheme } from "hooks/useTheme"
import { View,} from "react-native"
import { getColors } from "static/color"
import { ReactNode } from "react"

interface CorporateCardProps{
    children:ReactNode
}
const CorporateCard=({children}:CorporateCardProps)=>{
    const {theme}=useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    return(
        <>
        <View style={{backgroundColor:selectioncardColor, elevation:4}} className="w-full h-56 rounded-2xl shadow-slate-300 shadow-sm justify-center">
        {children}
        </View>
        </>
    )
}
export default CorporateCard