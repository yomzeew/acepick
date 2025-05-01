import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { ProfessionalDetails } from "component/dashboardComponent/clientdetail"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
interface JobAlertScreenProps{
    setshowalertModal:(value:boolean)=>void
    showalertModal:boolean
}
const JobAlertScreen=({setshowalertModal,showalertModal}:JobAlertScreenProps)=>{
    const {theme}=useTheme()
    const {primaryColor,backgroundColortwo,selectioncardColor}=getColors(theme)
    return(
        <>
        <View style={{backgroundColor:primaryColor}} className="absolute h-full w-full z-50 opacity-90"/>
        <View className="absolute h-full w-full z-50 opacity-70 justify-center items-center px-3">
            <View
                style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl justify-center items-center"
            >
                <ThemeText size={Textstyles.text_cmedium}>
                    Kehinde Shobare
                </ThemeText>
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                    Need your Service
                </ThemeTextsecond>
                <ThemeText size={Textstyles.text_cmedium}>
                    Plumbling Work in Kitchen
                </ThemeText>
                <ThemeTextsecond size={Textstyles.text_xsma}>
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                </ThemeTextsecond>
                <EmptyView height={10}/>
                <View className="flex-row gap-x-2 items-center">
                <FontAwesome6 name="location-dot" size={14} color={"red"} />
                <ThemeText size={Textstyles.text_cmedium}>
                  No 2 Alejo Akure Ondo State
                </ThemeText>

                </View>
               
            </View>
            <EmptyView height={20}/>
            <View className="w-full flex-row justify-center gap-x-5">
            <TouchableOpacity onPress={()=>setshowalertModal(!showalertModal)} style={{backgroundColor:backgroundColortwo}} className="w-24 h-16 items-center justify-center rounded-xl">
                <Text style={[Textstyles.text_cmedium,{color:"#ffffff"}]}>
                    Accept
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:"red"}} className="w-24 h-16 items-center justify-center rounded-xl">
                <Text style={[Textstyles.text_cmedium,{color:"#ffffff"}]}>
                    Decline
                </Text>
            </TouchableOpacity>

            </View>
          
            
        </View>
        </>
    )
}
export default JobAlertScreen