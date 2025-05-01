import { FontAwesome } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { View,Text, ScrollView, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const InvoiceViewScreen = () => {
    const router=useRouter()
    const {theme}=useTheme()
    const {secondaryTextColor,primaryColor}=getColors(theme)
    const [showmodal,setshowmodal]=useState(false)
    return (
        <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"View Invoice"} />
                    <EmptyView height={10} />
                    <View className="items-end w-full">
                        <TouchableOpacity onPress={()=>router.push('/editinvoiceLayout')} className="flex-row gap-3">
                        <ThemeText size={Textstyles.text_cmedium}>Edit</ThemeText>
                        <FontAwesome size={20} color={primaryColor} name="pencil" />
                        </TouchableOpacity>
                       

                    </View>
                    <View style={{borderColor:primaryColor}} className="p-5 h-[65%] w-full border border-dashed">
                        <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="w-full h-full ">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                Job Title:
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_cmedium}>
                            Rewiring of 2 rooms and fixing of 3 lamp holders
                            </ThemeText>
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                Job description:
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                            Managed a kitchen remodeling project, including 
                            new cabinetry, electrical work, and plumbing upgrades.
                            </ThemeText>
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                             Job mode
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                             Physical 
                            </ThemeText>
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                             Address:
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                             No 3, Adetilehin Street, Behind St. Jacob’s Hotel, Alagbaka, Akure.
                            </ThemeText>
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                            <View className="flex-row gap-x-2 w-full items-center justify-between">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                             State:
                             
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                             Ondo
                            </ThemeText> 

                            </View>
                            <View className="flex-row gap-x-2 w-full items-center justify-between">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                             LGA:
                             
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                             Akure
                            </ThemeText> 

                            </View>
                            
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                           
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                             WorkmanShip:
                            </ThemeTextsecond>
                            <ThemeText size={Textstyles.text_xsmall}>
                             N20,0000
                            </ThemeText>
                            <EmptyView height={10}/>
                            <Divider/>
                            <EmptyView height={20}/>
                            <View className="w-full items-end">
                                <ThemeText size={Textstyles.text_medium}>
                                    Total Price: N45,000
                                </ThemeText>

                            </View>
                            <EmptyView height={20}/>
                            <ButtonFunction color={primaryColor} text={"Show Material"} textcolor={"#ffffff"} onPress={() => setshowmodal(!showmodal)} />
                            
                           

                        </View>

                        </ScrollView>
                       
                    </View>
                    <EmptyView height={10}/>
                    <View className="w-full">
                    <ButtonFunction color={primaryColor} text={"Make Payment"} textcolor={"#ffffff"} onPress={() => setshowmodal(!showmodal)} />
                    </View>
                </View>

            </ContainerTemplate>
            {showmodal &&
            <SliderModalTemplate modalHeight={"80%"}  showmodal={showmodal} setshowmodal={setshowmodal} >
                <View className="p-3 w-full">
                <MaterialCard/>
                <EmptyView height={10}/>
                <MaterialCard/>
                <EmptyView height={10}/>
                <MaterialCard/>
                <EmptyView height={10}/>
                <MaterialCard/>
                <EmptyView height={10}/>

                </View>
                <ButtonFunction color={primaryColor} text={"Close"} textcolor={"#ffffff"} onPress={() => setshowmodal(!showmodal)} />

            </SliderModalTemplate>
                }
        </>
    )
}
export default InvoiceViewScreen

const MaterialCard=()=>{
    const { theme } = useTheme()
    const { selectioncardColor } = getColors(theme)
    return(
        <>
         <View
                            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full flex-row justify-between h-auto items-center py-3 px-3 shadow-sm shadow-black rounded-xl"

                        >
                            <View className="w-2/3">
                            <ThemeText size={Textstyles.text_small}>
                            13amps Lamp Holder
                            </ThemeText>
                            <View className="flex-row gap-x-3">
                            <ThemeText size={Textstyles.text_xsmall}>
                            Price:N20,000
                            </ThemeText>
                            <ThemeText size={Textstyles.text_xsmall}>
                           Quantity:5
                            </ThemeText>

                            </View>

                            </View>
                            <View className="w-1/3">
                            <ThemeText size={Textstyles.text_medium}>N3,000</ThemeText>

                            </View>

                        </View>
        </>
    )
}