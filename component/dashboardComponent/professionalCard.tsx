import { View, TextInput, TouchableOpacity,Image } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { getColors } from "../../static/color"
import { ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import EmptyView from "../emptyview"
import { FontAwesome5 } from "@expo/vector-icons"

interface ProfessionalCardProps{
profession:string;
totalnumber:number
totaluser:number
}
const ProfessionalCard=({profession,totalnumber,totaluser}:ProfessionalCardProps)=>{
    const {theme}=useTheme()
    const {selectioncardColor,secondaryTextColor,primaryColor}=getColors(theme)
    return(
        <>

        <View style={{backgroundColor:selectioncardColor,elevation:4}} className="w-full h-24 flex-row  gap-5 items-center rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View>
                <Image className="w-16 h-16 rounded-2xl"  resizeMethod="scale" resizeMode="contain" source={require('../../assets/professionimage1.png')} />
            </View>
            <View>
            <ThemeTextsecond size={Textstyles.text_xmedium}>
              {profession}
            </ThemeTextsecond>
            <View className="flex-row gap-3">
                <View className="flex-row gap-1">
                <FontAwesome5 color={primaryColor} name="toolbox" size={15} />
                <ThemeTextsecond size={Textstyles.text_xsma}>{totalnumber}</ThemeTextsecond>
                </View>
                <View className="flex-row gap-1">
                <FontAwesome5 color={secondaryTextColor} name="user" size={15} />
                <ThemeTextsecond size={Textstyles.text_xsma}>{totaluser}</ThemeTextsecond>
                </View>
            </View>
            </View>       
        </View>
        </>
    )
}

export default ProfessionalCard