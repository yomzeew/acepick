import { ReactNode } from "react"
import { View } from "react-native"
import HeaderComponent from "./headercomponent"
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import { StatusBar } from "expo-status-bar";

const ContainerTemplate=({children}:{children:ReactNode})=>{
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    return(
        <View style={{backgroundColor:backgroundColor}} className="h-full flex-1 w-full px-3">
        <StatusBar style="auto" />
        {children}
        </View>
    )
}
export default ContainerTemplate