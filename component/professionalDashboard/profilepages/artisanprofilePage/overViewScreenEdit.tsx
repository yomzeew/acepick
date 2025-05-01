import BackComponent from "component/backcomponent"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, View } from "react-native"
import { getColors } from "static/color"

const OverviewScreenEdit=()=>{
        const {theme}=useTheme()
        const router=useRouter()
        const {primaryColor,secondaryTextColor}=getColors(theme)

        const handleNav=()=>{
            router.push('/artisanSettingLayout')
    
        }

        return(
            <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Professional Intro"}/>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 w-full items-center b">
                        
                    <EmptyView height={20}/>
                    <KeyboardAvoidingView behavior="padding" style={{ flex: 1,width:"100%"  }}>
                    <ScrollView 
            contentContainerStyle={{  paddingHorizontal: 12 }}
            keyboardShouldPersistTaps="handled"
        >
                   <View className="w-full">
                   <InputComponentTextarea 
                    color={primaryColor} 
                    placeholder={"Describe the Service you render"} 
                    placeholdercolor={secondaryTextColor}
                    multiline={true}
                    />

                   </View>
                 
                   

                  </ScrollView>
                    </KeyboardAvoidingView>
                    
                    </View>
                    </TouchableWithoutFeedback>
    
                   
                </View>
            </ContainerTemplate>
            <View className="absolute bottom-10 w-full px-3">
            <ButtonFunction 
            color={primaryColor} 
            text={"Finish"} 
            textcolor={"#ffffff"} 
            onPress={handleNav}
            />

        </View>
            </>
        
    )
}
export default OverviewScreenEdit 