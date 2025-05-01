import { FontAwesome5 } from "@expo/vector-icons"
import ButtonFunction from "component/buttonfunction"
import InputComponent from "component/controls/textinput"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import SelectComponent from "component/dashboardComponent/selectComponent"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, Text } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import professionalSectors from "utilizes/professionalData"

const ProfessionalScreenEdit = () => {
    const { theme } = useTheme()
    const router = useRouter()
    const [showSlideUp, setShowSlideUp] = useState(false)
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)

    const handleShowSlide = () => {
        setShowSlideUp(!showSlideUp)
    }
    return (
        <>
            {showSlideUp &&
                <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
                    <AddNewProfessional setShowSlideUp={setShowSlideUp} />
                </SliderModalTemplate>

            }
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Professions"} />
                    <View className="w-full items-end">
                        <TouchableOpacity onPress={handleShowSlide} className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2">
                            <Text className="text-white">Add new</Text>
                        </TouchableOpacity>

                    </View>
                    <EmptyView height={20} />
                    <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-full h-24 justify-between items-center py-3 px-3 shadow-sm shadow-black flex-row rounded-xl">
                        <View className="">
                            <Text className="text-left">
                                <ThemeText size={Textstyles.text_small}>
                                    Electrician
                                </ThemeText>
                            </Text>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                <FontAwesome5 name="star" color="yellow" /> 3years
                            </ThemeTextsecond>
                        </View>
                        <View className="items-end">
                            <Text className="text-right">
                                <ThemeText size={Textstyles.text_small}>
                                    Construction and Building
                                </ThemeText>
                            </Text>
                            <TouchableOpacity className="w-24 py-2 px-3 bg-slate-400 rounded-xl items-center justify-center">
                                <Text className="text-slate-600">Default</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ContainerTemplate>
        </>
    )
}
export default ProfessionalScreenEdit
interface AddNewProfessionalProps{
    setShowSlideUp:(value:boolean)=>void

}
const AddNewProfessional = ({setShowSlideUp}:AddNewProfessionalProps) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, } = getColors(theme)
    const [sector, setSector] = useState("")
    const [profess, setProfess] = useState("")
    const [professionData, setProfessionData] = useState<any[]>([])

    const professionalsectors: any[] = professionalSectors
    const getProssData = () => {
        const selectedProfessions: any[] = professionalSectors.find(item => item.sector === sector)?.professions || [];
        setProfessionData(selectedProfessions)
    }
    useEffect(() => {
        getProssData()
    }, [sector])
    const handleSubmit=()=>{
        setShowSlideUp(false)
    }

    return (
        <>
            <View className="w-full h-auto px-3 py-5">
                <View className="w-full items-center">
                    <ThemeText size={Textstyles.text_medium}>
                        Add Profession
                    </ThemeText>
                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <SelectComponent
                        title="Professional Sector"
                        width="100%"
                        data={professionalsectors.map(item => item.sector)}
                        setValue={setSector}
                        value={sector}
                    />

                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <SelectComponent
                        title="Professional Sector"
                        width="100%"
                        data={professionData}
                        setValue={setProfess}
                        value={profess}
                    />

                </View>
                <EmptyView height={20} />
                <View className="w-full">
                    <InputComponent
                        color={primaryColor}
                        placeholder={"Years of Experience"}
                        placeholdercolor={secondaryTextColor}
                         keyboardType="numeric"
                    />

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
                    Upload Portfolio (optional)
                </ThemeText>
                <EmptyView height={10} />
                <View className="flex-row gap-x-2 w-full items-center justify-center">
                    <TouchableOpacity className="w-16 h-16 rounded-lg items-center justify-center bg-slate-400">
                        <FontAwesome5 size={20} name="camera" />
                    </TouchableOpacity>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                        <FontAwesome5 size={20} name="plus"  />
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                    <FontAwesome5 size={20} name="plus"  />
                    </View>
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                    <FontAwesome5 size={20} name="plus"  />
                    </View>   
                    <View className="w-16 h-16 rounded-lg items-center justify-center bg-slate-300">
                    <FontAwesome5 size={20} name="plus"  />
                    </View>


                </View>
                <EmptyView height={40} />
                <ButtonFunction color={primaryColor} text={"Finish"} textcolor={"#ffffff"} onPress={handleSubmit}/>


            </View>
        </>
    )
}