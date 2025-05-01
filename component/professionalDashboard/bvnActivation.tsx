import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import BackComponent from "component/backcomponent"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { View,Text, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const BvNActivation=()=>{
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const {theme}=useTheme()
    const {primaryColor,secondaryTextColor}=getColors(theme)
    return(
        <>
         {showmodal && 
        <SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
            <SlideupContent/>
        </SliderModalTemplate>
}
         <ContainerTemplate>
            <View className="h-full w-full flex-col pt-[56px] ">
                <BackComponent bordercolor={primaryColor} textcolor={primaryColor}/>
                <EmptyView height={30}/>
                <View className="w-full items-center px-3">
                    <ThemeText size={Textstyles.text_medium}>Account activation</ThemeText>
                </View>
                <EmptyView height={60} />
                <View className="w-full items-center px-3">
                    <ThemeText size={Textstyles.text_small}>
                       <Text className="text-center">
                       Enter your Bank Verification Number (BVN) to activate your account
                        </Text> 
                    </ThemeText>
                </View>
                <EmptyView height={60} />
                <View className="w-full items-center px-3">
                    <InputComponent  color={primaryColor} placeholder="Enter your Bvn" placeholdercolor={secondaryTextColor}/>
                    <EmptyView height={10}/>
              <View className="w-full">
              <TouchableOpacity>
                    <Text style={[Textstyles.text_xsmall,{color:"red"}]}>
                        <AntDesign size={20} name="warning" color={"red"}/>
                        <Text> </Text>
                         Why should i provide my BVN?
                    </Text>
                </TouchableOpacity>
                </View>  

                </View>
                

                </View>
                


                </ContainerTemplate>
                <View className="absolute bottom-10  w-full  items-center px-3">
                    <View className="w-full items-center">
                    <ButtonFunction color={primaryColor} text={"Activate Account"} textcolor={"#ffffff"} onPress={()=>setshowmodal(!showmodal) }/>

                    </View>
                  

                </View>
       
        </>
    )
}
export default BvNActivation
const SlideupContent=()=>{
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    return(
        <>
        <View className="h-full w-full px-3 items-center justify-center">
        <EmptyView height={60}/>
            <View className="w-full flex-1 items-center">
                
            <MaterialCommunityIcons name="check-decagram" size={36} color="green" />

            </View>
            <EmptyView height={60}/>
            <View className="w-full items-center">

                <ThemeText size={Textstyles.text_medium}>
                Activation Successful
                </ThemeText>
                <ThemeText size={Textstyles.text_xsmall}>
                    <Text className="text-center">
                    Your account has been activated successfully
                    </Text>
              
                </ThemeText>

            </View>
            <EmptyView height={60}/>
            <View className="w-full items-center px-3">
            <ButtonComponent color={primaryColor} text={"Go to Dashboard"} textcolor={"#ffffff"} route={"/homeprofessionalayout"}/>


            </View>
           
        </View>
        </>
    )
}