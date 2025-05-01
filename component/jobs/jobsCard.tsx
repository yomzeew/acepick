import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { View,Text, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const JobCard=()=>{
    const {theme}=useTheme()
    const {primaryColor,secondaryTextColor,selectioncardColor}=getColors(theme)
    return(
        <>
         <View
         style={{ backgroundColor: selectioncardColor, elevation: 4 }}
         className="w-full flex-row justify-between h-24 items-center py-3 px-3 shadow-sm shadow-black rounded-xl"
         
        >
            <ThemeText size={Textstyles.text_medium}>
                My Jobs
            </ThemeText>
            <View style={{backgroundColor:primaryColor}} className="w-10 rounded-full items-center justify-center h-10">
                <Text style={{color:"#ffffff"}} >
                    2
                </Text>
            </View>
        </View>
        </>
    )
}
export default JobCard