import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import { View,Text, TouchableOpacity } from "react-native"
import { Textstyles } from "static/textFontsize"
import ButtonFunction from "component/buttonfunction"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"

const Bankdeposit=()=>{
    const { theme } = useTheme();
            const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme); 
    return(
        <>
        <ContainerTemplate>
        <HeaderComponent title="Bank Deposit" />
        <EmptyView height={10} />
         <View style={{backgroundColor:"#33658A"}} className="h-[20vh] rounded-2xl p-5 items-center justify-center  w-full">
            <Text style={[Textstyles.text_medium,{color:'#ffffff'}]}>
                10029930303
            </Text>
            <Text style={[Textstyles.text_cmedium,{color:'#ffffff'}]}>
                PaystackTitan
            </Text>
            <Text style={[Textstyles.text_cmedium,{color:'#ffffff'}]}>
                Oluwadamilola Adex
            </Text>
         </View>
         <EmptyView height={30} />
            <View className="px-3">
            <ButtonFunction onPress={()=>console.log('ok')} textcolor="#ffffff" color={primaryColor}  text="Make 2000 Payment" />
            </View>
        </ContainerTemplate>
        </>
    )
}
export default Bankdeposit