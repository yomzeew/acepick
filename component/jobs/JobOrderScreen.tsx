import ButtonFunction from "component/buttonfunction"
import Checkbox from "component/controls/checkbox"
import StateandLga from "component/controls/stateandlga"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import { ProfessionalDetailsWithoutChat } from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const JobOrderScreen=()=>{
    const [showmanuallocation,setShowmanuallocation]=useState(true)
    const {theme}=useTheme()
   const {primaryColor,secondaryTextColor}=getColors(theme)
    return (
        <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Job Order"} />
                    <EmptyView height={20} />
                    <ProfessionalDetailsWithoutChat/>
                    <EmptyView height={40} />
                    <View className="w-full">
                        <InputComponent color={primaryColor} placeholder={"Job title"} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        <ThemeTextsecond size={Textstyles.text_small}>No of Jobs</ThemeTextsecond>
                        <InputComponent  keyboardType="numeric" color={primaryColor} placeholder={""} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        <ThemeTextsecond size={Textstyles.text_small}>Job description</ThemeTextsecond>
                        <InputComponentTextarea color={primaryColor} placeholder={"Type it here"} placeholdercolor={secondaryTextColor}/>
                        <EmptyView height={20}/>
                        
                        <View className="w-full">
                            <View className="flex-row gap-x-2">
                                <Checkbox isChecked={showmanuallocation} onToggle={()=>setShowmanuallocation(!showmanuallocation)} />
                                <ThemeTextsecond size={Textstyles.text_small}>Pick location automatic</ThemeTextsecond>
                            </View>
                            <View>

                            </View>

                        </View>
                        
                        {!showmanuallocation &&<View className="w-full">
                            <EmptyView height={20}/>
                           <InputComponent color={primaryColor} placeholder={"Enter the job site address"} placeholdercolor={secondaryTextColor}/>

                        </View>}
                        <EmptyView height={20}/>
                        <View className="w-full">
                            <ButtonFunction 
                            color={primaryColor} 
                            text={"Submit"} 
                            textcolor={secondaryTextColor} 
                            onPress={function (): void {
                                throw new Error("Function not implemented.")
                            } }
                            />

                        </View>
                       

                    </View>
                 
                    
                      
                </View>

            </ContainerTemplate>

        </>
    )
}
export default JobOrderScreen