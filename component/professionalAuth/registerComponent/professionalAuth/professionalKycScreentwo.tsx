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
import { useLocalSearchParams, useRouter } from "expo-router";
import EmptyView from "component/emptyview";
import StateandLga, { Modaldisplay } from "component/controls/stateandlga";

const ProfessionalScreenKycTwo = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor,backgroundColor } = getColors(theme)
    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [showOption, setShowOption] = useState<boolean>(false);
    const [isStateSelection, setIsStateSelection] = useState<boolean>(true); // Track if selecting state or LGA
    const [data, setData] = useState<string[]>([]);

    const {type}=useLocalSearchParams()


    return (
        <>
         {showOption &&
                <Modaldisplay 
                data={data} 
                isStateSelection={isStateSelection} 
                setstate={(text:string)=>setstate(text)} 
                setlga={(text:string)=>setlga(text)} 
                setShowOption={(text:boolean)=>setShowOption(text)}
                />
                }
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
                                <Text className="text-center" style={[Textstyles.text_xsmall, { color: "red" }]}>
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

                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Company Email Address"
                                    placeholdercolor={secondaryTextColor}
                                />
                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Company Phone Number"
                                    placeholdercolor={secondaryTextColor}
                                />
                                <EmptyView height={10} />
                                <StateandLga
                                    state={state}
                                    lga={lga}
                                    setstate={(text: string) => setstate(text)}
                                    setlga={(text: string) => setlga(text)}
                                    isStateSelection={isStateSelection}
                                    setIsStateSelection={(text: boolean) => setIsStateSelection(text)}
                                    setShowOption={(text: boolean) => setShowOption(text)}
                                    showOption={showOption}
                                    data={data}
                                    setData={(text: string[]) => setData(text)}
                                />
                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Office Address"
                                    placeholdercolor={secondaryTextColor}
                                />
                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="Registration Number"
                                    placeholdercolor={secondaryTextColor}
                                />
                                <EmptyView height={10} />
                                <InputComponent
                                    color={primaryColor}
                                    placeholder="No of Employees"
                                    placeholdercolor={secondaryTextColor}
                                />

                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </AuthComponent>
                <View className="absolute bottom-0 w-full px-6">
                    <View className="items-center w-full">
                        <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route={`/directorkyclayout?type=corporate`} />
                        <View className="h-10"></View>

                    </View>

                </View>
            </View>
        </>

    );
}

export default ProfessionalScreenKycTwo
