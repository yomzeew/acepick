import { FontAwesome6 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const InvoiceScreen = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)
    const [showmodal, setshowmodal] = useState(false)
    const [showsuccess,setshowsuccess]=useState(false)
    const handlePress = () => {
        setshowmodal(true)

    }
    return (
        <>

            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Invoice"} />
                    <EmptyView height={20} />
                    <View className="w-full flex-1">
                        <InputComponent color={primaryColor} placeholder={"Jobs Duration"} placeholdercolor={secondaryTextColor} />
                        <EmptyView height={20} />
                        <ThemeTextsecond size={Textstyles.text_xsma}>Enter your workmanship</ThemeTextsecond>
                        <InputComponent prefix={true} icon={<Text style={[Textstyles.text_medium, { color: "#ffffff" }]}>₦</Text>} color={primaryColor} placeholder={"Price"} placeholdercolor={"#ffffff"} />
                        <EmptyView height={20} />
                        <View className="w-full items-end ">
                            <TouchableOpacity onPress={handlePress} style={{ backgroundColor: "#33658A" }} className="px-3 w-36 h-12 justify-center items-center rounded-xl">
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>+ Add Job Material</Text>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={20} />
                        <MaterialCard/>
                       
                    </View>
                    <View className="absolute bottom-20  w-full">
                        <ButtonFunction color={primaryColor} text={"Submit"} textcolor={"#ffffff"} onPress={() => setshowsuccess(!showsuccess)} />
                    </View>
                </View>
            </ContainerTemplate>
            {showmodal &&
                <SliderModalNoScrollview modalHeight={"80%"} showmodal={showmodal} setshowmodal={setshowmodal}>
                    <AddMaterial
                        showmodal={showmodal}
                        setshowmodal={(value: boolean) => setshowmodal(value)}
                    />
                </SliderModalNoScrollview>}
                {showsuccess &&
                <SliderModalNoScrollview modalHeight={"60%"} showmodal={showsuccess} setshowmodal={setshowsuccess}>
                    <View className="items-center w-full ">
                        <EmptyView height={60}/>
                        <FontAwesome6 name="circle-check" size={36} color={primaryColor}/>
                        <EmptyView height={20}/>
                        <ThemeText size={Textstyles.text_medium}>
                            Successful
                        </ThemeText>
                        <EmptyView height={60}/>
                        <ButtonFunction color={primaryColor} text={"Ok"} textcolor={"#ffffff"} onPress={() => setshowsuccess(!showsuccess)} />
                    </View>
                </SliderModalNoScrollview>
                }
        </>
    )
}
export default InvoiceScreen

interface AddMaterialProps {
    showmodal: boolean
    setshowmodal: (value: boolean) => void
}

const AddMaterial = ({ showmodal, setshowmodal }: AddMaterialProps) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    return (
        <>
            <View className="w-full h-full py-5 px-3">
                <ThemeText size={Textstyles.text_medium}>
                    Add material
                </ThemeText>
                <EmptyView height={20} />
                <ThemeText size={Textstyles.text_xsmall}>
                    Describe the Item
                </ThemeText>
                <InputComponentTextarea multiline={true} color={primaryColor} placeholder={"Type here"} placeholdercolor={secondaryTextColor} />
                <EmptyView height={10} />
                <View className="w-full items-end">
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        0/200
                    </ThemeTextsecond>


                </View>
                <EmptyView height={20} />
                <View className="w-full items-center flex-row gap-x-1">
                    <View className="w-1/3">
                        <InputComponent keyboardType="numeric" color={primaryColor} placeholder={"Quantity"} placeholdercolor={secondaryTextColor} />

                    </View>
                    <View className="w-2/3">

                        <InputComponent prefix={true} icon={<Text style={[Textstyles.text_medium, { color: "#ffffff" }]}>₦</Text>} keyboardType="numeric" color={primaryColor} placeholder={"Price per unit"} placeholdercolor={secondaryTextColor} />
                    </View>
                </View>
                <EmptyView height={40} />
                <Divider />
                <EmptyView height={20} />
                <View className="w-full flex-row items-center justify-between">
                    <ThemeText size={Textstyles.text_small}>
                        Sub Total
                    </ThemeText>
                    <ThemeTextsecond size={Textstyles.text_small}>
                        ₦7,800
                    </ThemeTextsecond>

                </View>
                <EmptyView height={20} />
                <View className="">
                    <ButtonFunction color={primaryColor} text={"Add"} textcolor={"#ffffff"} onPress={() => setshowmodal(!showmodal)} />
                </View>

            </View>
        </>
    )
}
const MaterialCard=()=>{
    const { theme } = useTheme()
    const { selectioncardColor } = getColors(theme)
    return(
        <>
         <View
                            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full flex-row justify-between h-auto items-center py-3 px-3 shadow-sm shadow-black rounded-xl"

                        >
                            <View className="w-2/3">
                            <ThemeText size={Textstyles.text_small}>
                            13amps Lamp Holder
                            </ThemeText>
                            <View className="flex-row gap-x-3">
                            <ThemeText size={Textstyles.text_xsmall}>
                            Price:N20,000
                            </ThemeText>
                            <ThemeText size={Textstyles.text_xsmall}>
                            Quantity:5
                            </ThemeText>

                            </View>

                            </View>
                            <View className="w-1/3">
                            <Text style={[Textstyles.text_small,{color:"red"}]}>delete</Text>
                            <ThemeText size={Textstyles.text_medium}>N3,000</ThemeText>

                            </View>

                        </View>
        </>
    )
}