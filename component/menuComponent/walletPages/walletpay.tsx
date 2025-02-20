import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../profilePages/headerComp"
import EmptyView from "component/emptyview"
import WalletCard from "component/dashboardComponent/walletcompoment"
import { TouchableOpacity, View } from "react-native"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import SliderModalTemplate from "component/slideupModalTemplate"
import { useState } from "react"
import PaymentmethodModal from "./paymentmethodModal"


const WalletPay=()=>{
    const [showmodal, setshowmodal]=useState<boolean>(false)
    const { theme } = useTheme();
        const { primaryColor,selectioncardColor,secondaryTextColor } = getColors(theme);
    return(
        <>
        {showmodal &&
        <SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
            <PaymentmethodModal/>
        </SliderModalTemplate>}
        <ContainerTemplate>
                <HeaderComponent title="Wallet and payments" />
                <EmptyView height={10} />

                <WalletCard showmodal={showmodal} setshowmodal={setshowmodal}/>

                <EmptyView height={20}/>
                <View   style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">

                <TouchableOpacity  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-2 items-center">
                    <Ionicons name="remove-circle" color="red" size={16}/>
                    <ThemeTextsecond size={Textstyles.text_xmedium}>Withdraw Money</ThemeTextsecond>
                    </View>
                <AntDesign name="right" size={24} color={secondaryTextColor} />
                </TouchableOpacity>
                
                <TouchableOpacity  className="flex-row justify-between items-center h-20 border-b border-slate-400">
                    <View className="flex-row gap-x-2 items-center">
                    <FontAwesome5 name="lock" color={primaryColor} size={16}/>
                    <ThemeTextsecond size={Textstyles.text_xmedium}>Create Transaction Pin</ThemeTextsecond>
                    </View>
                <AntDesign name="right" size={24} color={secondaryTextColor} />
                </TouchableOpacity>
                
                
            </View>
                

             
            
            </ContainerTemplate>
        
        </>
    )
}
export default WalletPay