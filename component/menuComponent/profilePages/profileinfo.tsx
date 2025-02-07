import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "./headerComp"
import { View,ScrollView,TouchableOpacity, Text } from "react-native"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { LinearGradient } from "expo-linear-gradient";
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import Divider from "component/divider"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import EmptyView from "component/emptyview"
import { useState } from "react"
import SliderModalTemplate from "component/slideupModalTemplate"
import VerificationComponent from "./verificationcomp"
import SliderModal from "component/SlideUpModal"

const Profileinfo=()=>{
    const {theme}=useTheme()
    const {primaryColor,primaryTextColor,selectioncardColor}=getColors(theme)
    const [showmodal,setshowmodal]=useState<boolean>(false)
    const[showmodalVerify,setshowmodalVerify]=useState<boolean>(false)
    const route='/profilelayout'
return(
    <>
    {showmodal &&<SliderModalTemplate showmodal={showmodal} setshowmodal={setshowmodal} modalHeight={'85%'}>
       <VerificationComponent setshowmodalVerify={(text:boolean)=>setshowmodalVerify(text)} setshowmodal={(text:boolean)=>setshowmodal(text)}/>
    </SliderModalTemplate>}
    {showmodalVerify && <SliderModal route={route} title="Successfull" setshowmodal={setshowmodalVerify} showmodal={showmodalVerify} textbutton="Back to Profile" subtitle="We will update your profile after proper verification" />

    }
    <ContainerTemplate>
        <>
        <HeaderComponent title="Edit Personal Information"/>
        <View className="px-3 h-32 mt-10">
        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-full rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
            <View className="items-center">
            <ThemeText
            size={Textstyles.text_medium}
            className="font-extralight text-white mt-8"
            >
             Oluwadamilola's Profile
            </ThemeText>

            </View>
         
          </View>
          <View className="items-center w-full -mt-12">
            <View>
              <TouchableOpacity
                className="absolute right-0 bottom-0 z-40 bg-white w-8 h-8 rounded-full flex justify-center items-center"
              >
                <FontAwesome size={20} color={primaryColor} name="pencil" />
              </TouchableOpacity>
              <View className="h-24 w-24 rounded-full bg-slate-400 items-center justify-center ">
                <FontAwesome5 name="camera" size={20} color={primaryColor} />
              </View>
          
            </View>
          </View>
        </View>
        <View className="flex-1 px-3  mt-16 w-full">
          <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-5">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mt-3 flex  flex-row justify-between">
                <ThemeText size={Textstyles.text_medium} className="font-bold">
                  Biodata
                </ThemeText>
                <TouchableOpacity>
                <FontAwesome size={20} color={primaryColor} name="pencil" />
                </TouchableOpacity>
              </View>
              <View className="border-red-500 border-b-1" />
              <View className="mt-5 w-full flex-row items-center  flex justify-between">
              <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Lastname
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Firstname
                </ThemeTextsecond>
              </View>
              <Divider />
              <View className="mt-3 w-full flex-row items-center  flex justify-between">
                <ThemeTextsecond size={Textstyles.text_cmedium} >
                  Gender: Male
                </ThemeTextsecond>
              </View>
              <Divider />
              <View className="mt-3 w-full flex-row items-center  flex justify-between">
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Date of Birth:
                </ThemeTextsecond>
              </View>
              <View className="mt-5 flex  flex-row justify-between">
              <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Address
                </ThemeTextsecond>
                <TouchableOpacity >
                  <FontAwesome color={primaryColor} size={20} name="pencil" />
                </TouchableOpacity>
              </View>
             <Divider/>
              <View className="mt-3 w-full flex-row items-center  flex justify-between">
              <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Country: 
                </ThemeTextsecond>
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                  State: 
                </ThemeTextsecond>
              </View>
              <Divider />
              <View className="mt-3 w-full flex-row items-center  flex justify-between">
              <ThemeTextsecond size={Textstyles.text_cmedium}>
                  City: 
              </ThemeTextsecond>
              </View>
              <Divider />

              <View className="mt-3 w-full">
              <ThemeTextsecond size={Textstyles.text_cmedium}>
                  Address:
                </ThemeTextsecond>
              </View>
              <Divider />
              <View className="mt-5 flex  flex-row justify-between">
              <ThemeText size={Textstyles.text_medium}>
                  Contact: 
                </ThemeText>
                <TouchableOpacity>
                  <FontAwesome color={primaryColor} size={20} name="pencil" />
                </TouchableOpacity>
              </View>
             <Divider/>
              <View className="mt-3 w-full ">
                <ThemeTextsecond size={Textstyles.text_cmedium} >
                  Phone: 
                </ThemeTextsecond>
              </View>
              <Divider />
              <View className="mt-3 w-full">
              <ThemeTextsecond size={Textstyles.text_cmedium} >
                  Email:
            </ThemeTextsecond>
              </View>
    
          
              <Divider />
            </ScrollView>
          </View>
          <EmptyView height={20}/>
          <ButtonFunction onPress={()=>setshowmodal(true)} text="Proceed to Verification" textcolor="white"  color={primaryColor} />
        </View>
        </>
    </ContainerTemplate>
    </>
)
}
export default Profileinfo