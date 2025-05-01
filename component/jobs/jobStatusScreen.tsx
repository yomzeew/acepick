import { AntDesign, Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeTextsecond } from "component/ThemeText"
import { useLocalSearchParams } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const JobStatusScreen=()=>{
    const {jobstatus}=useLocalSearchParams()
    return (
        <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={jobstatus} />
                    <EmptyView height={20} />
                    <JobCard/>
                   
                </View>

            </ContainerTemplate>

        </>
    )
}
export default JobStatusScreen

const JobCard=()=>{
    const {theme}=useTheme()
    const {selectioncardColor,primaryColor}=getColors(theme)
    return(
        <>
         <View
            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
        >
            <ThemeTextsecond size={Textstyles.text_small}>
            Residential Renovation - Kitchen Remodeling
            </ThemeTextsecond>
            <EmptyView height={10}/>
            <ThemeTextsecond size={Textstyles.text_xsma}>
            Managed a kitchen remodeling project, including 
            new cabinetry, electrical work, and plumbing upgrades.
            </ThemeTextsecond>
            <EmptyView height={10}/>
            <View className="flex-row justify-between">
                <View>
                <View className="flex-row gap-x-2">
                    <Entypo size={16} name="location-pin" color={"red"} />
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                    Ajah, Lagos state
                    </ThemeTextsecond>

                </View>
                <EmptyView height={10}/>
                 <ThemeTextsecond size={Textstyles.text_xsma}>
                 3months
                 </ThemeTextsecond>
                 <EmptyView height={10}/>
                 <Divider/>
                 <EmptyView height={20}/>
                 <ThemeTextsecond size={Textstyles.text_xsma}>
                 July 13, 2023
                 </ThemeTextsecond>

                 </View>

                
                <View>
                    <View>
                      
                    <ThemeTextsecond size={Textstyles.text_cmedium}>
                      N21,300
                    </ThemeTextsecond>

                    </View>
                    <EmptyView height={10}/>
                    <TouchableOpacity style={{backgroundColor:primaryColor}} className="w-12 h-12 rounded-full items-center justify-center">
                        <AntDesign size={20} name="arrowright"/>
                    </TouchableOpacity>
                   
                </View>

            </View>

        </View>
        </>
    )
}