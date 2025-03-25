import ButtonComponent from "component/buttoncomponent"
import StateandLga, { Modaldisplay } from "component/controls/stateandlga"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { KeyboardAvoidingView, ScrollView, View, Text, Platform, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga"

const CorporateReg = () => {

    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const [lga, setlga] = useState<string>("")
    const [state, setstate] = useState<string>("")
    const [showOption, setShowOption] = useState<boolean>(false);
    const [isStateSelection, setIsStateSelection] = useState<boolean>(true); // Track if selecting state or LGA
    const [data, setData] = useState<string[]>([]);



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

            <ContainerTemplate>
                <HeaderComponent
                    title={"Create Corporate Account"}
                />
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
                            <InputComponent
                                color={primaryColor}
                                placeholder="Email Address"
                                placeholdercolor={secondaryTextColor}
                            />
                            <EmptyView height={10} />
                            <InputComponent
                                color={primaryColor}
                                placeholder="Phone Number"
                                placeholdercolor={secondaryTextColor}
                            />
                            <EmptyView height={10} />
                            <StateandLga 
                            state={state} 
                            lga={lga} 
                            setstate={(text:string)=>setstate(text)}
                            setlga={(text:string)=>setlga(text)}  
                            isStateSelection={isStateSelection}
                            setIsStateSelection={(text:boolean)=>setIsStateSelection(text)}
                            setShowOption={(text:boolean)=>setShowOption(text)}   
                            showOption={showOption} 
                            data={data}   
                            setData={(text:string[])=>setData(text)}           
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
                <View className="z-40 absolute bottom-0 w-full px-6">
                    <View className="items-center w-full">
                        <ButtonComponent color={primaryColor} text="Next" textcolor="#fff" route="/(professionAuth)/passwordpagelayout" />
                        <View className="h-10"></View>

                    </View>

                </View>

            </ContainerTemplate>




        </>
    )
}
export default CorporateReg