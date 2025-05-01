import ClientDetails from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const MyAPjobScreen=()=>{
    return(
        <>
        <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"My Jobs"} />
                    <EmptyView height={20} />
                    <Jobdetails/>
                </View>
        </ContainerTemplate>
        </>
    )
}
export default MyAPjobScreen

const Jobdetails=()=>{
    const router=useRouter()
    const {theme}=useTheme()
    const {selectioncardColor,primaryColor}=getColors(theme)
    return(
        <>
        <View
                 style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                 className="w-full  h-auto items-center py-5 px-3 shadow-sm shadow-black rounded-xl"

        >
            <ThemeText size={Textstyles.text_small}>
                Kitchen Renovation 
            </ThemeText>
            <EmptyView height={20} />
            <ClientDetails/>
            <EmptyView height={20} />
            <ThemeTextsecond size={Textstyles.text_xsma}>
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
            </ThemeTextsecond>
            <EmptyView height={20} />
            <View className="flex-row w-full justify-between">
                <TouchableOpacity onPress={()=>router.push('/invoiceLayout')} style={{backgroundColor:primaryColor}} className="items-center justify-center px-2 h-10 rounded-xl">
                <Text style={{color:"#ffffff"}}>
                        Generate Invoice
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>router.push('/invoiceViewPageLayout')} style={{backgroundColor:primaryColor}} className="items-center justify-center px-2 h-10 rounded-xl">
                <Text style={{color:"#ffffff"}}>
                        View Invoice
                    </Text>
                </TouchableOpacity>


            </View>


       </View>
        </>
    )
}
