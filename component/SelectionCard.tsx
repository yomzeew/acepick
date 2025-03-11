import { useTheme } from "hooks/useTheme"
import { ReactNode } from "react"
import { View } from "react-native"
import { getColors } from "static/color"
interface SelectioncardColorProps{
    children:ReactNode
    height:any
}
const SelectionCard=({children,height}:SelectioncardColorProps)=>{
    const {theme}=useTheme()
    const {selectioncardColor}=getColors(theme)
    return(
        <>
         <View style={{backgroundColor:selectioncardColor, elevation:4,height:height}} className="w-full py-3 px-3  rounded-2xl shadow-slate-300 shadow-sm justify-center">
            {children}
         </View>
        </>
    )
}
export default SelectionCard