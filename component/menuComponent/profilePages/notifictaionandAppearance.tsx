import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "./headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Switch, View } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"

const NotificationAppearance=()=>{
    const {theme}=useTheme()
    const {primaryColor,secondaryTextColor,selectioncardColor}=getColors(theme)
    return(
        <>
        <ContainerTemplate>
            <HeaderComponent title="Notification and appearance" />
             <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}className="w-full h-24 justify-center rounded-2xl shadow-slate-500 shadow-sm px-5">
                <View className="flex-row justify-between">
                    <ThemeTextsecond size={Textstyles.text_cmedium}>Call Notification</ThemeTextsecond>
                    <Switch thumbColor={"#ffffff"}  trackColor={{ false: "#ccc", true: primaryColor }}  style={{ transform: [{ scaleX: 0.75}, { scaleY: 0.75 }] }}  />
                </View>
             </View>
             <EmptyView height={10}/>
             <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}className="w-full h-24 justify-center rounded-2xl shadow-slate-500 shadow-sm px-5">
                <View className="flex-row justify-between">
                    <ThemeTextsecond size={Textstyles.text_cmedium}>Messanger Notification</ThemeTextsecond>
                    <Switch thumbColor={"#ffffff"}  trackColor={{ false: "#ccc", true: primaryColor }}  style={{ transform: [{ scaleX: 0.75}, { scaleY: 0.75 }] }}  />
                </View>
             </View>
             <EmptyView height={10}/>
             <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}className="w-full h-24 justify-center rounded-2xl shadow-slate-500 shadow-sm px-5 ">
                <View className="flex-row justify-between">
                    <ThemeTextsecond size={Textstyles.text_cmedium}>Hire Alert Notification</ThemeTextsecond>
                    <Switch thumbColor={"#ffffff"}  trackColor={{ false: "#ccc", true: primaryColor }}  style={{ transform: [{ scaleX: 0.75}, { scaleY: 0.75 }] }}  />
                </View>
             </View>
             <EmptyView height={40}/>
             <View><ThemeText size={Textstyles.text_xsma}>Appearance</ThemeText></View>
             <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}className="w-full h-24 justify-center rounded-2xl shadow-slate-500 shadow-sm px-5">
                <View className="flex-row justify-between">
                    <ThemeTextsecond size={Textstyles.text_cmedium}>Dark</ThemeTextsecond>
                    <Switch thumbColor={"#ffffff"}  trackColor={{ false: "#ccc", true: primaryColor }}  style={{ transform: [{ scaleX: 0.75}, { scaleY: 0.75 }] }}  />
                </View>
             </View>
        </ContainerTemplate>
        </>
    )
}
export default NotificationAppearance