import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "./headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View } from "react-native"

const NotificationAppearance=()=>{
    const {theme}=useTheme()
    const {primaryColor,secondaryTextColor,selectioncardColor}=getColors(theme)
    return(
        <>
        <ContainerTemplate>
            <HeaderComponent title="Notification and appearance" />
             <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                        className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
             </View>
        </ContainerTemplate>
        </>
    )
}
export default NotificationAppearance