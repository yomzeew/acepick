import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native"
import AuthComponent from "../../Authcontainer"
import InputComponent from "component/controls/textinput"
import { getColors } from "static/color";
import { useTheme } from "hooks/useTheme";
import ButtonComponent from "component/buttoncomponent";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { useEffect, useState } from "react";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";
import { Textstyles } from "static/textFontsize";
import { useRouter } from "expo-router";
import EmptyView from "component/emptyview";
import { Modaldisplay } from "component/controls/stateandlga";

const ProfessionalScreenKycOne = () => {
    const { theme } = useTheme();
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    const router = useRouter();
    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [lgalist, setlgalist] = useState<string[]>([])
    const statelist: string[] = getAllStates()
    const getlgalist = () => {
        const lgaArray: string[] = getLgasByState(state)
        setlgalist(lgaArray)
    }
    useEffect(() => {
        getlgalist()
    }, [state])
  
  
    return (
      <>
      <View style={{ backgroundColor: backgroundColor }} className="w-full h-full">
      <AuthComponent title="Register as a professional">  
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={{ width: "100%", alignItems: "center" }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
              <View className="w-full items-center">
               
                <Text className="text-center" style={[Textstyles.text_xsmall,{ color: "red" }]}>
                Please ensure data provided are valid for verifications
              </Text> 
              <EmptyView height={10} />
  
              {/* Input Fields */}
              <InputComponent
                color={primaryColor}
                placeholder="First Name"
                placeholdercolor={secondaryTextColor}
              />
              <EmptyView height={10} />
              <InputComponent
                color={primaryColor}
                placeholder="Last Name"
                placeholdercolor={secondaryTextColor}
              />
               <EmptyView height={10} />
              <InputComponent
                color={primaryColor}
                placeholder="Phone Number"
                placeholdercolor={secondaryTextColor}
              />
               <EmptyView height={10} />
              <InputComponent
                color={primaryColor}
                placeholder="Email Address"
                placeholdercolor={secondaryTextColor}
              />
               <EmptyView height={10} />
              <InputComponent
                color={primaryColor}
                placeholder="Your Role"
                placeholdercolor={secondaryTextColor}
              />
  
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
          
      </AuthComponent>
      <View className="absolute bottom-0 w-full px-6">
          <View className="items-center w-full">
          <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="/professionalkyctwolayout" />
          <View className="h-10"></View>
  
          </View>
         
        </View>
      </View>
      </>
      
    );
  }

export default ProfessionalScreenKycOne
