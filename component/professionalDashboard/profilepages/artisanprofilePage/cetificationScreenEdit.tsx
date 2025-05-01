import { Feather, FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const CertificationScreenEdit=()=>{
 const { theme } = useTheme()
     const [showSlideUp, setShowSlideUp] = useState(false)
     const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
 
     const handleShowSlide = () => {
         setShowSlideUp(!showSlideUp)
     }
     return (
         <>
             {showSlideUp &&
                 <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
                     <AddCertification setShowSlideUp={setShowSlideUp} />
                 </SliderModalTemplate>
             }
             <ContainerTemplate>
                 <View className="h-full w-full flex-col">
                     <HeaderComponent title={"Certifications"} />
                     <View className="w-full items-end">
                         <TouchableOpacity onPress={handleShowSlide} className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2">
                             <Text className="text-white">Add new</Text>
                         </TouchableOpacity>
 
                     </View>
                     <EmptyView height={20} />
                     <Certification/>
                    
 
                 </View>
             </ContainerTemplate>
         </>
     )
}
export default CertificationScreenEdit
interface AddCertificationProps{
    setShowSlideUp:(value:boolean)=>void
}
const AddCertification=({setShowSlideUp}:AddCertificationProps)=>{
    const {theme}=useTheme()
        const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
        const handleSubmit=()=>{
            setShowSlideUp(false)
        }
    return(
        <>
        <View className="w-full h-auto px-3 py-5">
            <View className="items-center">
                <ThemeText size={Textstyles.text_medium}>
                    Add Education
                </ThemeText>

            </View>
            <EmptyView height={20}/>
            <View className="w-full">
                <InputComponent 
                color={primaryColor} 
                placeholder={"Certificate title"} 
                placeholdercolor={secondaryTextColor}  
                />
                <EmptyView height={20}/>
                <InputComponent 
                color={primaryColor} 
                placeholder={"Company Issue"} 
                placeholdercolor={secondaryTextColor}  
                />
                 <EmptyView height={20}/>
                <ThemeTextsecond size={Textstyles.text_xsma}>Issue Date</ThemeTextsecond>
                <InputComponent 
                color={primaryColor} 
                placeholder={"Issue Date"} 
                placeholdercolor={secondaryTextColor}  
                prefix={true}
                fieldType="date"
                icon={<FontAwesome5 name="calendar" size={20} color="#ffffff"/>}
                />

            </View>
            <EmptyView height={40} />
                <ButtonFunction color={primaryColor} text={"Finish"} textcolor={"#ffffff"} onPress={handleSubmit}/>

        </View>
        </>
    )
}
const Certification=()=>{
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto   py-3 px-3 shadow-sm shadow-black  rounded-xl">
                <View className="w-full flex-row justify-between items-baseline">
                    <View className="w-2/3">
                        <ThemeText size={Textstyles.text_xsmall}>
                        CERTIFICATE OF ELECTRICAL PRACTITIONER
                        </ThemeText>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-red-500">
                        <FontAwesome5 size={16} color="#ffffff" name="trash" />
                    </View>


                </View>
                <EmptyView height={10} />
                <ThemeTextsecond size={Textstyles.text_xsmall}>
               <Feather name="circle" color={primaryColor} size={10} /> GLORIOUS WORLD OF ELECTRICALS CO. LTD
                </ThemeTextsecond>
                <EmptyView height={10} />
                <View className="w-full">
                   
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            May 7, 2022
                        </ThemeTextsecond>

                </View>
                <EmptyView height={10} />
              


            </View>
        </>
    )
}


