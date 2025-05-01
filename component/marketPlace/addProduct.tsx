import ButtonFunction from "component/buttonfunction"
import Checkbox from "component/controls/checkbox"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { ScrollView, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const Addproduct=()=>{
    const [category,setCategory]=useState<string>('')
    const categoryData = [
       "Electronics",
       "Fashion",
       "Groceries",
       "Books",
       "Home Appliances",
       "Health & Beauty",
      ];
    const {theme}=useTheme()
    const {primaryColor,secondaryTextColor}=getColors(theme)
    return(
        <>
        <ContainerTemplate>
        <HeaderComponent title={"Add Product"}/>
        <EmptyView height={20}/>
        <View className="h-full w-full">
        <ScrollView className="px-4 space-y-4">
        <ThemeText size={Textstyles.text_xsmall}>Product Name</ThemeText>
        <InputComponent
        placeholder="Enter product name" 
        color={primaryColor} 
        placeholdercolor={secondaryTextColor}          
        />
         <EmptyView height={10}/>
         
        <ThemeText size={Textstyles.text_xsmall}>Description</ThemeText>
        <InputComponent
        placeholder="Enter Description" 
        color={primaryColor} 
        placeholdercolor={secondaryTextColor}  
        multiline

        />
         <EmptyView height={10}/>
        <View className="flex-row gap-x-2 items-center justify-end">
         <Checkbox 
         isChecked={false} 
         onToggle={function (value: boolean): void {
                            throw new Error("Function not implemented.")
                        } }
                        />
         <ThemeText  size={Textstyles.text_xsmall}>AI auto generated</ThemeText>

         </View>
      
       <EmptyView height={10}/>
       <ThemeText size={Textstyles.text_xsmall}>Amount (₦)</ThemeText>
       <InputComponent
        placeholder="Enter amount"
        color={primaryColor} 
        placeholdercolor={secondaryTextColor}  
        keyboardType="numeric"
        />
        <EmptyView height={10}/>
        
        <ThemeText size={Textstyles.text_xsmall}>Category</ThemeText>
        <SelectComponent 
        title={"e.g. Electronics, Fashion"} 
        width={'100%'} 
        data={categoryData } 
        setValue={(text:string)=>setCategory(text)} 
        value={category}
                        />
        <EmptyView height={10}/>
        <ThemeText size={Textstyles.text_xsmall}>Stock Quantity</ThemeText>
        <InputComponent
        placeholder="Enter available stock"
        color={primaryColor} 
        placeholdercolor={secondaryTextColor}  
        keyboardType="numeric"
        />
        <EmptyView height={10}/>
       <ButtonFunction 
       color={primaryColor} 
       text={"Submit Product"} 
       textcolor={"#fffff"} 
       onPress={
        function (): 
        void { throw new Error("Function not implemented.")
      } }/>
      </ScrollView>
            
        </View>
        </ContainerTemplate>
        </>
    )
}
export default Addproduct