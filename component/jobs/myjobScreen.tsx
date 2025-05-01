import { FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import { ProfessionalDetails } from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const MyjobScreen=()=>{
    const [showmodal,setshowmodal]=useState<boolean>(false)
 
    return(
        <>
        <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"My Jobs"} />
                    <EmptyView height={20} />
                    <Jobdetails
                    setshowmodal={setshowmodal}
                    showmodal={showmodal}
                    />
                </View>
        </ContainerTemplate>
        <SliderModalTemplate  showmodal={showmodal} modalHeight={"80%"} setshowmodal={setshowmodal}>
            <>
            <View className="w-full items-end px-3 py-3">
        <TouchableOpacity onPress={()=>setshowmodal(!showmodal)}>
        <FontAwesome5 name="times-circle" size={20} color="red" />
        </TouchableOpacity>
        </View>
        <UpdetailsJob/>
            </>
       </SliderModalTemplate>
        </>
    )
}
export default MyjobScreen

interface JobdetailsProps{
    setshowmodal:(value:boolean)=>void
    showmodal:boolean
}

const Jobdetails=({setshowmodal,showmodal}:JobdetailsProps)=>{
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
            <ProfessionalDetails/>
            <EmptyView height={20} />
            <ThemeTextsecond size={Textstyles.text_xsma}>
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
                Plumbling work -Repair Water sink tap
            </ThemeTextsecond>
            <EmptyView height={20} />
            <View className="flex-row w-full justify-between">
                <TouchableOpacity onPress={()=>setshowmodal(!showmodal)}  style={{backgroundColor:primaryColor}} className="items-center justify-center px-2 h-10 rounded-xl">
                    <Text style={{color:"#ffffff"}}>
                        Update Details
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
const UpdetailsJob=()=>{
    const {theme}=useTheme()
    const {selectioncardColor,primaryColor,secondaryTextColor}=getColors(theme)
    return(
        <>
        <ContainerTemplate >
            <View className="flex-row justify-between items-center">
            <ThemeTextsecond size={Textstyles.text_cmedium}>
                Update Details
            </ThemeTextsecond>
            </View>
            <Divider/>
            <EmptyView height={20}/>
            <InputComponent color={primaryColor} placeholder={"Job title"} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        <ThemeTextsecond size={Textstyles.text_small}>No of Jobs</ThemeTextsecond>
                        <InputComponent  keyboardType="numeric" color={primaryColor} placeholder={""} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        <ThemeTextsecond size={Textstyles.text_small}>Job description</ThemeTextsecond>
                        <InputComponentTextarea color={primaryColor} placeholder={"Type it here"} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        <View className="w-full">
                            <ButtonFunction 
                            color={primaryColor} 
                            text={"Update"} 
                            textcolor={secondaryTextColor} 
                            onPress={function (): void {
                                throw new Error("Function not implemented.")
                            } }
                            />

                        </View>

        </ContainerTemplate>
        </>
    )
}
