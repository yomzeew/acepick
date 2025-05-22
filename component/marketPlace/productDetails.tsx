import ButtonFunction from "component/buttonfunction"
import { ClientDetailsWithoutChat, ProfessionalDetailsWithoutChat } from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { View,Image } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const ProductDetails=()=>{
   const router=useRouter()
       const { theme } = useTheme()
       const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
        <>
        <ContainerTemplate>
        <HeaderComponent title={"Item Details"}/>
        <EmptyView height={20}/>
        <View className="h-full w-full">
            <Image resizeMode="cover" className="w-full h-[20%]" source={require('../../assets/samplework.png')}/>
            <EmptyView height={20}/>
            <View className="flex-row justify-between">
            <View>
            <ThemeText size={Textstyles.text_cmedium}>2 Gang Electical Switch</ThemeText>
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>Electrical</ThemeTextsecond>

            </View>
            <View className="items-end">
            <ThemeText size={Textstyles.text_cmedium}>N4,000</ThemeText>
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>Qty 3</ThemeTextsecond>

            </View>

            </View>
            
            
            <EmptyView height={20}/>
             <View  style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <ThemeTextsecond size={Textstyles.text_xsmall}>
            The 2 Gang Electrical Switch features two individual 
            rocker switches housed in a single faceplate, 
            allowing you to control two separate light 
            fittings or appliances independently. Ideal for both 
            residential and commercial spaces, this switch combines 
            functionality with a sleek, modern design. It's compatible 
            with standard wiring systems and is easy to install in most 
            back boxes. Whether you're upgrading your home lighting or 
            managing multiple circuits in an office, the 2 gang switch 
            offers convenient dual control from one central point.
                </ThemeTextsecond> 
             </View>
             <EmptyView height={20}/>
             <View className="w-full">
                <ThemeText size={Textstyles.text_xsmall}>
                    Location City:Akure
                </ThemeText>
             </View>
             <EmptyView height={20}/>
             <ClientDetailsWithoutChat/>
             <EmptyView height={10}/>
       <ButtonFunction 
       color={primaryColor} 
       text={"Buy"} 
       textcolor={"#fffff"} 
       onPress={
        function (): 
        void { throw new Error("Function not implemented.")
      } }/>
        
            
        </View>
        </ContainerTemplate>
        </>
    )
}
export default ProductDetails