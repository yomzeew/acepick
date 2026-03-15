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
    const [idNumber,setIdNumber]=useState<string>('')
    const [error, setError]=useState<string>('')
    const ids= ['NIN','BVN']
     const { theme } = useTheme();
    const { primaryColor, backgroundColor, backgroundColortwo, secondaryTextColor, errorColor } = getColors(theme); 

    const validateInput = () => {
        if (!getValue) {
            setError('Please select an ID type')
            return false
        }
        if (!idNumber) {
            setError('Please enter your ID number')
            return false
        }
        if (getValue === 'NIN' && idNumber.length !== 11) {
            setError('NIN must be 11 digits')
            return false
        }
        if (getValue === 'BVN' && idNumber.length !== 11) {
            setError('BVN must be 11 digits')
            return false
        }
        if (!/^\d+$/.test(idNumber)) {
            setError('ID number must contain only digits')
            return false
        }
        setError('')
        return true
    }

    const handleVerify = () => {
        if (validateInput()) {
            setshowmodalVerify(true)
        }
    } 
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
            <TextInput 
              keyboardType="numeric" 
              value={idNumber}
              onChangeText={(text) => {
                setIdNumber(text)
                setError('')
              }}
              placeholder="Enter ID Number"
              placeholderTextColor={secondaryTextColor}
              style={{
                width:288, 
                height: 64, 
                borderWidth: 1, 
                borderColor: error ? errorColor : secondaryTextColor,
                borderRadius: 12,
                paddingHorizontal: 16,
                color: secondaryTextColor,
                backgroundColor: backgroundColor
              }} 
              maxLength={11}
            />
            {error && (
              <Text style={[Textstyles.text_xxxsmall, { color: errorColor }]} className="mt-1">
                {error}
              </Text>
            )}
            </View>
            <EmptyView height={20} />
            <View className="w-full items-center">
            <View style={{width:288}} > 
                <ButtonFunction 
                  onPress={handleVerify} 
                  textcolor="#ffffff" 
                  color={primaryColor} 
                  text="Verify Now" 
                />
            </View>
            <EmptyView height={20} />
            <View style={{width:288}} > 
                <ButtonFunctionoutline 
                  style={{borderWidth:1,borderColor:primaryColor,backgroundColor:backgroundColor}} 
                  onPress={()=>setshowmodal(false)} 
                  textcolor={primaryColor} 
                  text="Cancel" 
                />
            </View>

            </View>
          
            

           
           
           


        </View>
        
        </>
    )
}
export default VerificationComponent