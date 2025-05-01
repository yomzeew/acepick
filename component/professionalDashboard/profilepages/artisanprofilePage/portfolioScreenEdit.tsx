import { FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent, { InputComponentTextarea } from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const PortfolioScreenEdit = () => {
    const { theme } = useTheme()
    const [showSlideUp, setShowSlideUp] = useState(false)
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)

    const handleShowSlide = () => {
        setShowSlideUp(!showSlideUp)
    }
    return (
        <>
            {showSlideUp &&
                <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
                    <AddPortfolio setShowSlideUp={setShowSlideUp} />
                </SliderModalTemplate>
            }
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Portfolio"} />
                    <View className="w-full items-end">
                        <TouchableOpacity onPress={handleShowSlide} className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2">
                            <Text className="text-white">Add new</Text>
                        </TouchableOpacity>

                    </View>
                    <EmptyView height={20} />
                    <Portfolio />

                </View>
            </ContainerTemplate>
        </>
    )
}
export default PortfolioScreenEdit
interface AddNewPprtfolioProps {
    setShowSlideUp: (value: boolean) => void

}
const AddPortfolio = ({ setShowSlideUp }: AddNewPprtfolioProps) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)

    const handleSubmit = () => {
        setShowSlideUp(false)
    }

    return (
        <>
            <View className="w-full h-auto px-3 py-5">
                <View className="w-full items-center">
                    <ThemeText size={Textstyles.text_medium}>
                        Add Portfolio
                    </ThemeText>
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponent
                        color={primaryColor}
                        placeholder={"Project title"}
                        placeholdercolor={secondaryTextColor}
                    />
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponentTextarea
                        color={primaryColor}
                        placeholder={"Brief description"}
                        placeholdercolor={secondaryTextColor}
                        multiline
                    />

                </View>
                <EmptyView height={10} />
                <View className="w-full items-end">
                    <ThemeText size={Textstyles.text_small}>
                        0/120 words
                    </ThemeText>
                </View>
                <EmptyView height={20} />
                <View className="w-full flex-row gap-x-2">
                    <View className="w-1/2">
                        <InputComponent
                            color={primaryColor}
                            placeholder={"Duration of project"}
                            placeholdercolor={secondaryTextColor}
                        />
                    </View>
                    <View className="w-1/2">
                        <InputComponent
                            color={primaryColor}
                            placeholder={"Date"}
                            placeholdercolor={secondaryTextColor}
                            prefix={true}
                            fieldType="date"
                            icon={<FontAwesome5 name="calendar" size={20} color="#ffffff" />}
                        />
                    </View>
                </View>
                <View className="w-full items-end">
                <ThemeTextsecond size={Textstyles.text_xsma}>Project Date</ThemeTextsecond>
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponent
                        color={primaryColor}
                        placeholder={"How much do you charge"}
                        placeholdercolor={secondaryTextColor}
                        prefix={true}
                        icon={<Text style={[Textstyles.text_medium]} className="text-white">₦</Text>}
                        keyboardType="numeric"
                    />

                </View>
                <EmptyView height={20} />
                <ThemeText size={Textstyles.text_small}>
                    Your portfolio
                </ThemeText>
                <EmptyView height={10} />
                <View className="flex-row gap-x-2 w-full items-center justify-center">
                    <TouchableOpacity className="w-16 h-16 rounded-lg items-center justify-center bg-slate-400">
                        <FontAwesome5 size={20} name="camera" />
                    </TouchableOpacity>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        <FontAwesome5 size={20} name="plus" />
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        <FontAwesome5 size={20} name="plus" />
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        <FontAwesome5 size={20} name="plus" />
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        <FontAwesome5 size={20} name="plus" />
                    </View>


                </View>
                <EmptyView height={10} />
                <View>
                    <Text style={[Textstyles.text_xsmall, { color: "red" }]}>JPEG (Maximum upload size 5mb)</Text>
                </View>
                <EmptyView height={40} />
                <ButtonFunction color={primaryColor} text={"Finish"} textcolor={"#ffffff"} onPress={handleSubmit} />


            </View>
        </>
    )
}

const Portfolio = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    return (
        <>
            <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-auto   py-3 px-3 shadow-sm shadow-black  rounded-xl">
                <View className="w-full flex-row justify-between">
                    <View className="w-2/3">
                        <ThemeText size={Textstyles.text_small}>
                            Resisdential Renovation---Kitchen Remodelling
                        </ThemeText>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-red-500">
                        <FontAwesome5 size={16} color="#ffffff" name="trash" />
                    </View>


                </View>

                <ThemeTextsecond size={Textstyles.text_xsmall}>
                    Managed a Kitchen remodeling project including
                    new cabinetry electrical work and plumbling upgrade
                </ThemeTextsecond>
                <EmptyView height={10} />
                <View className="w-full flex-row justify-between">
                    <View>
                        <ThemeText size={Textstyles.text_xsmall}>
                            <FontAwesome5 name="clock" />
                            <Text> </Text>
                            3 months
                        </ThemeText>

                    </View>
                    <View>
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            May 7,2022
                        </ThemeTextsecond>

                    </View>

                </View>
                <EmptyView height={10} />
                <GalleryView />


            </View>
        </>
    )
}

const GalleryView = () => {
    return (
        <>
            <View className="flex-row gap-x-2 w-full items-center justify-center">
                <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">

                </View>
                <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">

                </View>
                <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">

                </View>
                <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">

                </View>
                <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">

                </View>


            </View>
        </>
    )
}