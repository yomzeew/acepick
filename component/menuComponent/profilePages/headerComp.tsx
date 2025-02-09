import {View} from 'react-native'
import { ThemeText } from 'component/ThemeText'
import BackComponent from 'component/backcomponent'
import { Textstyles } from 'static/textFontsize'
import { useTheme } from 'hooks/useTheme'
import { getColors } from 'static/color'
const HeaderComponent=({title}:{title:string})=>{
        const { theme } = useTheme();
        const { primaryColor } = getColors(theme);
    return(
        <>
        <View className="pt-[60px]">  
            <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
        </View>
        <View className="px-3 mt-12">
            <ThemeText type="primary" size={Textstyles.text_medium}>
               {title}
            </ThemeText>
        </View>
        </>
    )
}
export default HeaderComponent