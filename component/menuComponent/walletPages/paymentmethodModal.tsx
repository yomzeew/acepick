import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { TextInput, TouchableOpacity, View,Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const PaymentmethodModal=()=>{
    const [showmodal, setshowmodal]=useState<boolean>(false)
    const [amount,setamount]=useState<string>('')
    const [errorMsg,seterrorMsg]=useState<string>('')
    const router=useRouter()
        const { theme } = useTheme();
        const { primaryColor,selectioncardColor,secondaryTextColor } = getColors(theme);
    const handlenavcardpay=()=>{
        if(!amount){
            seterrorMsg("Please Enter Amount")
            return
        }
        router.push(`/cardpaymentlayout/${amount}`)

    }
    return(
        <>
         <View className="p-5 items-center w-full">
         <EmptyView height={40} />
            <View className="w-full">
            <ThemeText size={Textstyles.text_xsma}>
                Enter Amount
        </ThemeText>
        {errorMsg &&<Text style={[Textstyles.text_xsma,{color:"red"}]}>{errorMsg}</Text>}
        <View className="w-full h-12">
        <View className="h-12 w-full absolute top-6">
            <ThemeText size={Textstyles.text_small}>₦</ThemeText>
        </View>
        <TextInput  
        style={{color:secondaryTextColor}} 
        keyboardType="numeric" 
        className="h-12 w-full text-lg border-b px-5 border-b-slate-400 mt-2"
        onChangeText={(text:string)=>setamount(text)}
        />
        </View>
       
            </View>
            
         
        
        <EmptyView height={30} />
            <ThemeText size={Textstyles.text_small}>
                Payment Method
            </ThemeText>
            <EmptyView height={10} />
            <TouchableOpacity onPress={handlenavcardpay} className="w-full h-16">
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}  className="w-full h-full flex-row gap-x-3 items-center justify-center rounded-2xl ">
                <FontAwesome5 name="credit-card" color={primaryColor} size={16}/>
                <ThemeTextsecond size={Textstyles.text_xmedium}>Card Payment</ThemeTextsecond>
                </View>

            </TouchableOpacity>
            <EmptyView height={20} />
            <TouchableOpacity className="w-full h-16">
                <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}  className="w-full h-full items-center flex-row gap-x-3 justify-center rounded-2xl ">
                <FontAwesome name="bank" color={primaryColor} size={16}/>
                <ThemeTextsecond size={Textstyles.text_xmedium}>Bank Deposit</ThemeTextsecond>
                </View>

            </TouchableOpacity>


            </View>
        </>
    )
}
export default PaymentmethodModal