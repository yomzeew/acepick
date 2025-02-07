import { AntDesign } from "@expo/vector-icons"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { Text } from "react-native"
import {TouchableOpacity,View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
interface SelectComponentProp{
    title:string
    width: number|`${number}%`
    data:string[]
    setValue:(value:string)=>void
    value:string
}
const SelectComponent=({title,width=288,data,setValue,value}:SelectComponentProp)=>{
   const { theme } = useTheme();
   const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor } = getColors(theme); 
   const [showoption,setshowoption]=useState<boolean>(false) 
    return(
        <>
        <View style={{width:width}} className="w-72 relative">
            <View className="h-auto">
            <TouchableOpacity onPress={()=>setshowoption(!showoption)} className="w-full h-14 border rounded-xl border-slate-400 flex-row items-center justify-between px-3">
           <ThemeTextsecond size={Textstyles.text_xsma}>
            {value===''?title:value }
           </ThemeTextsecond>
           <AntDesign name="down" size={16} color={secondaryTextColor}/>
           </TouchableOpacity>
           
          {showoption &&<View style={{backgroundColor:backgroundColor}} className="p-3 absolute z-50 top-16 w-full">
            <EmptyView height={10}/>
            {data.map((item,index)=>(
                <TouchableOpacity onPress={()=>{setValue(item); setshowoption(!showoption)}} className="w-full h-10">
                    <ThemeText size={Textstyles.text_xsma}>
                        {item}
                    </ThemeText>
                    <Divider/>
                </TouchableOpacity>

            )) }

        </View>}
      

            </View>
   
       
            
        </View>
     
        </>
    ) 
}
export default SelectComponent