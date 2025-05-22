
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { View,Image,Text,TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const CartProduct=()=>{
   const router=useRouter()
       const { theme } = useTheme()
       const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
        <>
        <ContainerTemplate>
        <HeaderComponent title={"My Items"}/>
        <EmptyView height={20}/>
        <View className="h-full w-full">
        <View className="items-center justify-center flex-row flex-wrap gap-3 w-full">
                    <ProductCard/>
                    <ProductCard/>
                    <ProductCard/>
                    <ProductCard/>
                    </View>
        </View>
        </ContainerTemplate>
        </>
    )
}
export default CartProduct
const ProductCard=()=>{
    const router=useRouter()
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
        <>
        <TouchableOpacity onPress={()=>router.push('/productdetailsLayout')}  style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-[45%] h-56 rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
            <View className="w-full items-center justify-center h-full">
                <Image className="w-16 h-16 rounded-full" source={require('../../assets/professionimage1.png')}/>
                <EmptyView height={20}/>
                <View className="flex-row items-center w-full justify-start">
                <ThemeText size={Textstyles.text_xxxsmall}>
                2 Gang electrical switch
                </ThemeText>
                {/* <TouchableOpacity>
                    <AntDesign size={20} color={primaryColor} name="like1"/>
                </TouchableOpacity> */}

                </View>
                <EmptyView height={10}/>
                <View className="w-full items-start">
                <Text style={[Textstyles.text_cmedium,{color:"green"}]}>
                    N30,0000
                </Text>
                </View>
                <EmptyView height={10}/>
                <View className="w-full items-start">
                <Text style={[Textstyles.text_cmedium,{color:"red"}]}>
                   Sold Out
                </Text>
                </View>
               

            </View>

        </TouchableOpacity>
        </>
    )
}