import { View } from "react-native"
import BackComponent from "../backcomponent"
import { useTheme } from "../../hooks/useTheme"
import { getColors } from "../../static/color"

const HeaderMenu=()=>{
    const {theme}=useTheme()
    const {secondaryTextColor,selectioncardColor,primaryColor}=getColors(theme)
    return(
        <>
        <View>
            <BackComponent textcolor={primaryColor} bordercolor={primaryColor}/>

        </View>
        </>
    )
}
export default HeaderMenu