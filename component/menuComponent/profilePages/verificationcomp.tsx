import ButtonFunction, { ButtonFunctionoutline } from "component/buttonfunction"
import InputComponent from "component/controls/textinput"
import SelectComponent from "component/dashboardComponent/selectComponent"
import EmptyView from "component/emptyview"
import WarningIcon from "component/icons/WarningIcon"
import SliderModal from "component/SlideUpModal"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { Text, TextInput } from "react-native"
import { View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const VerificationComponent=({setshowmodal,setshowmodalVerify}:{setshowmodal:(value:boolean)=>void,setshowmodalVerify:(value:boolean)=>void})=>{
    const [getValue,setValue]=useState<string>('')
    const ids= ['NIN','BVN']
     const { theme } = useTheme();
    const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme); 
    return(
        <>
         
        <View className="h-full w-full py-5 px-5">
   
            <View className="w-full items-center">
                <WarningIcon/>

            </View>
            <EmptyView height={20} />
            <View className="w-full items-center">
                <ThemeText className="text-center" size={Textstyles.text_medium}>Enter NIN or BVN  to validate your profile update</ThemeText>

            </View>
            <EmptyView height={20} />
            <View className="w-full items-center">
                <ThemeTextsecond  size={Textstyles.text_xsma}>Select ID Type</ThemeTextsecond>

            </View>
            <EmptyView height={20} />
            <View className="w-full items-center">
            <SelectComponent width={288} data={ids} title="Select ID Type" setValue={(text)=>setValue(text)} value={getValue}/>
            </View>
            <EmptyView height={20} />
           
            <View className="items-center">
            <TextInput keyboardType="numeric" style={{width:288}} className="h-16 w-full border border-slate-500  rounded-xl" />
            
            </View>
            <EmptyView height={20} />
            <View className="w-full items-center">
            <View style={{width:288}} > 
                <ButtonFunction onPress={()=>setshowmodalVerify(true)} textcolor="#ffffff" color={primaryColor} text="Verify" />
            </View>
            <EmptyView height={20} />
            <View style={{width:288}} > 
                <ButtonFunctionoutline style={{borderWidth:1,borderColor:primaryColor,backgroundColor:backgroundColor}} onPress={()=>setshowmodal(false)} textcolor={primaryColor} text="Cancel" />
            </View>

            </View>
          
            

           
           
           


        </View>
        
        </>
    )
}
export default VerificationComponent