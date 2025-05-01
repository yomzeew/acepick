import { FontAwesome5 } from "@expo/vector-icons"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { ReactNode } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"


const NotificationScreen = () => {
    return (
        <>
            <ContainerTemplate>
                <View className="h-full w-full flex-col">
                    <HeaderComponent title={"Notification"} />
                    <EmptyView height={20} />
                    <NotificationCard>
                        <JobStatus/>
                    </NotificationCard>
                    <EmptyView height={20} />
                    <NotificationCard>
                       <InvoiceNotification/>
                    </NotificationCard>
             
                </View>

            </ContainerTemplate>

        </>
    )
}
export default NotificationScreen
interface NotificationCardProps{
    children:ReactNode
}
const NotificationCard = ({children}:NotificationCardProps) => {
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);
  

    return (
        <View
            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl"
        >
            {children}
            
        </View>
    );
};
const JobStatus=()=>{
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);
    const router=useRouter()
    const notificationType="Pending"
    return(
        <>
        <View className="w-full flex-row items-center gap-x-2 justify-between">
                <View className="flex-row gap-x-2">
                    <FontAwesome5 size={20} name="toolbox" color={primaryColor} />
                    <ThemeText size={Textstyles.text_cmedium}>

                       Job Pending
                    </ThemeText>
                </View>

                <View>
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                        TODAY, 12:05PM
                    </ThemeTextsecond>

                </View>

            </View>
            <View className="w-full flex-row justify-between items-end">
                <View className="w-2/3">
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                    A pending Job from Falade Bidemi
                    </ThemeTextsecond>
                </View>
                <View className="w-1/3 items-end">
                    <TouchableOpacity onPress={()=>router.push(`/jobstatusLayout/${notificationType}`)} style={{backgroundColor:primaryColor}} className="w-24 h-8 items-center justify-center rounded-xl ">
                        <Text style={[Textstyles.text_small]}>View</Text>
                    </TouchableOpacity>

                </View>


            </View>
        </>
    )
}

const InvoiceNotification=()=>{
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);
    const router=useRouter()
    const notificationType="Invoice"
    return(
        <>
        <View className="w-full flex-row items-center gap-x-2 justify-between">
                <View className="flex-row gap-x-2">
                    <FontAwesome5 size={20} name="toolbox" color={primaryColor} />
                    <ThemeText size={Textstyles.text_cmedium}>

                        Invoice Approved
                    </ThemeText>
                </View>

                <View>
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                        TODAY, 12:05PM
                    </ThemeTextsecond>

                </View>

            </View>
            <View className="w-full flex-row justify-between items-end">
                <View className="w-2/3">
                    <ThemeTextsecond size={Textstyles.text_xsma}>
                        The invoice “Rewiring of 2 rooms and fixing of 3 lamp holders” has been approved.
                    </ThemeTextsecond>
                </View>
                <View className="w-1/3 items-end">
                    <TouchableOpacity onPress={()=>router.push(`/invoiceViewLayout`)} style={{backgroundColor:primaryColor}} className="w-24 h-8 items-center justify-center rounded-xl ">
                        <Text style={[Textstyles.text_small]}>View</Text>
                    </TouchableOpacity>

                </View>


            </View>

        </>
    )
}