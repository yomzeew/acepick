import { AntDesign, FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import BackComponent from "component/backcomponent"
import ButtonComponent from "component/buttoncomponent"
import ClientDetails from "component/dashboardComponent/clientdetail"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import Divider from "component/divider"
import EmptyView from "component/emptyview"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { TouchableOpacity, Text, View } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"

const ViewInvoiceScreen = () => {
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor } = getColors(theme)
    return (
        <>
            <ContainerTemplate>
                <View className="w-full pt-[56px] h-full">
                    <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                    <EmptyView height={60} />
                    <View className="w-full items-end">
                        <TouchableOpacity style={{ backgroundColor: primaryColor }} className="rounded-lg px-2 py-1 w-auto h-8 items-center justify-center">
                            <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>Location Check</Text>
                        </TouchableOpacity>
                    </View>
                    <EmptyView height={10} />
                    <View className="w-full">
                        <ClientDetails />
                    </View>
                    <EmptyView height={20} />
                    <View
                        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                        className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
                    >
                        <ThemeText size={Textstyles.text_cmedium}>
                            Residential Renovation - Kitchen Remodeling
                        </ThemeText>
                        <EmptyView height={10} />
                        <Text style={[Textstyles.text_medium, { color: "green" }]}>
                            N20,000
                        </Text>
                        <EmptyView height={10} />
                        <Divider />
                        <EmptyView height={10} />
                        <View className="w-full flex-row justify-between items-center">
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                March 28, 2024
                            </ThemeTextsecond>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                <FontAwesome5 size={20} name="clock" /> 1 day
                            </ThemeTextsecond>

                        </View>
                        <EmptyView height={10} />
                        <View className="w-full items-start">
                            <TouchableOpacity style={{ backgroundColor: primaryColor }} className="rounded-lg px-2 py-1 w-auto h-8 items-center justify-center">
                                <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>View full Detail</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <EmptyView height={20} />
                    <View className="w-full items-center">
                        <AntDesign color={"red"} name="warning" size={40} />
                        <EmptyView height={20}/>
                        <ThemeTextsecond size={Textstyles.text_xsma}>
                            This job will remain pending until the location check is fulfilled.
                        </ThemeTextsecond>
                        <EmptyView height={20} />
                        <Text className="text-center">
                        <ThemeTextsecond size={Textstyles.text_xsma}>
                            Failure to meet the client early may result to cancellation of this job by the client.
                        </ThemeTextsecond>

                        </Text>
                      

                    </View>
                    <EmptyView height={20} />
                    <ButtonComponent  color={primaryColor} text={"View Chat"} textcolor={"#ffffff"} route={""} onPress={function (): void {
                        throw new Error("Function not implemented.")
                    } }/>
                </View>

            </ContainerTemplate>
        </>
    )
}
export default ViewInvoiceScreen