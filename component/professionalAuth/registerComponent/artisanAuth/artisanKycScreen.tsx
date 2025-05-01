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

const ArtisanScreenKyc = () => {
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
      <AuthComponent title="Register as a artisan">  
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
              <View className="h-5"></View>
  
              {/* Upload Profile Picture Section */}
              <TouchableOpacity
                className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mb-4 self-center"
                style={{
                  borderWidth: 2,
                  borderColor: primaryColor,
                }}
              >
                <AntDesign name="camerao" size={36} color={primaryColor} />
              </TouchableOpacity>
              <Text className="text-lg text-center" style={{ color: primaryColor }}>
                Upload Profile Photo
              </Text>
              <View className="h-5"></View>
  
              {/* Input Fields */}
              <InputComponent
                color={primaryColor}
                placeholder="First Name"
                placeholdercolor={secondaryTextColor}
              />
              <View className="h-5"></View>
              <InputComponent
                color={primaryColor}
                placeholder="Last Name"
                placeholdercolor={secondaryTextColor}
              />
               <View className="h-5" />
                          <SelectComponent title={"Select State"}
                              width={"100%"}
                              data={statelist}
                              setValue={(text) => setstate(text)}
                              value={state}
                          />
                          <View className="h-5" />
                          <SelectComponent title={"Select State"}
                              width={"100%"}
                              data={lgalist}
                              setValue={(text) => setlga(text)}
                              value={lga}
                          />
                          <View className="h-5" />
              <View className="w-full px-6 pb-3">
              <Text className="" style={{ color: primaryColor }}>
                Residential Address
              </Text>
              </View>
             
              <InputComponent
                color={primaryColor}
                placeholder="Enter your full address"
                placeholdercolor={secondaryTextColor}
              />
  
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
          
      </AuthComponent>
      <View className="absolute bottom-0 w-full px-6">
          <View className="items-center w-full">
          <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="/(professionAuth)/passwordpagelayout?type=artisan" />
          <View className="h-10"></View>
  
          </View>
         
        </View>
      </View>
      </>
      
    );
  }

export default ArtisanScreenKyc
