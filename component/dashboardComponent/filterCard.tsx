import { View, TextInput, TouchableOpacity  } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { getColors } from "../../static/color"
import { ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import EmptyView from "../emptyview"
import { FontAwesome5 } from "@expo/vector-icons"



const FilterCard=()=>{
    const {theme}=useTheme()
    const {selectioncardColor,secondaryTextColor,primaryColor}=getColors(theme)
    return(
        <>
        <View style={{backgroundColor:selectioncardColor,elevation:4}} className="w-full h-[12%] rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
         <ThemeTextsecond size={Textstyles.text_xmedium}>
           Who are you looking for?
         </ThemeTextsecond>
         <EmptyView height={10}/>
         <View className="relative w-full">
        <TouchableOpacity style={{backgroundColor:'#033A62'}} className="h-12 w-12 z-50 absolute right-0 items-center justify-center rounded-full">
            <FontAwesome5 color={"#ffffff"} size="20" name="arrow-right"/>

        </TouchableOpacity>
         <TextInput placeholder="electrictian" placeholderTextColor={primaryColor} placeholderClassName="text-blue-900" style={{backgroundColor:theme==='dark'?'#4F4F4F':'#e2e8f0', color:secondaryTextColor, borderColor:theme==='dark'?'#4F4F4F':'#cbd5e1'}} className="rounded-3xl border h-12 px-3 w-full"/>
         </View>
         
        </View>
        </>
    )
}
export default FilterCard