import { useTheme } from "hooks/useTheme"
import { ScrollView, TouchableOpacity, View, Animated } from "react-native"
import { getColors } from "static/color"
import { ThemeTextsecond } from "./ThemeText"
import { Textstyles } from "static/textFontsize"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useRouter } from "expo-router"
import { useEffect, useRef } from "react"
import { FontAwesome5 } from "@expo/vector-icons"

const JobStatistics=()=>{
    const user=useSelector((state:RootState)=>state.auth.user)
    const router=useRouter()
    const completedJob=user?.profile.totalJobsCompleted || 0
    const jobinProgress=user?.profile.totalJobsOngoing || 0
    const jobinPending=user?.profile.totalJobsPending || 0
    const totalJobsCanceled=user?.profile.totalJobsCanceled || 0

    const jobStats = [
        { title: "Completed Jobs", count: completedJob, route: '/jobstatusLayout/COMPLETED', icon: "check-circle", color: "#10b981" },
        { title: "Jobs in Progress", count: jobinProgress, route: '/jobstatusLayout/ONGOING', icon: "clock", color: "#f59e0b" },
        { title: "Pending Jobs", count: jobinPending, route: '/jobstatusLayout/PENDING', icon: "hourglass-half", color: "#6b7280" },
        { title: "Canceled Jobs", count: totalJobsCanceled, route: '/jobstatusLayout/CANCELED', icon: "times-circle", color: "#ef4444" },
    ]

    return(
        <>
         <View  className="w-full  mt-2">
                            <ScrollView  horizontal   showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-x-4">
                                {jobStats.map((stat, index) => (
                                    <TouchableOpacity 
                                        key={stat.title}
                                        onPress={() => router.push(stat.route)}
                                        activeOpacity={0.7}
                                    >
                                        <Cardcomponent 
                                            Title={stat.title} 
                                            totalnumber={stat.count}
                                            icon={stat.icon}
                                            color={stat.color}
                                        />
                                    </TouchableOpacity>
                                ))}
                                </View>
                               
                            </ScrollView>
                        </View>
        </>
    )
}
export default JobStatistics

const Cardcomponent=({Title,totalnumber,icon,color}:{Title:string,totalnumber:number,icon:string,color:string})=>{
    const { theme } = useTheme()
    const { primaryTextColor, selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    return(
<View  style={{ backgroundColor: selectioncardColor, elevation: 4 }}  className="w-36 h-20 rounded-2xl px-3 py-2 mt-2">
<View className="w-full justify-between items-center h-full flex-row">
    <View className="flex-1">
        <ThemeTextsecond size={Textstyles.text_xsma}>{Title}</ThemeTextsecond>
        <View className="mt-1">
            <ThemeTextsecond size={Textstyles.text_small}>{totalnumber}</ThemeTextsecond>
        </View>
    </View>
    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <FontAwesome5 name={icon} size={12} color={color} />
    </View>
    </View>

</View>
    )


}