import React from "react"
import { useTheme } from "hooks/useTheme"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { getColors } from "static/color"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useRouter } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"

const JobStatistics = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, backgroundColortwo } = getColors(theme)
    const user = useSelector((state: RootState) => state.auth.user)
    const router = useRouter()
    const completedJob = user?.profile.totalJobsCompleted || 0
    const jobinProgress = user?.profile.totalJobsOngoing || 0
    const jobinPending = user?.profile.totalJobsPending || 0
    const totalJobsCanceled = user?.profile.totalJobsCanceled || 0

    const jobStats = [
        { title: "Completed", count: completedJob, route: '/jobstatusLayout/COMPLETED', icon: "check-circle", color: primaryColor },
        { title: "In Progress", count: jobinProgress, route: '/jobstatusLayout/ONGOING', icon: "clock", color: primaryColor },
        { title: "Pending", count: jobinPending, route: '/jobstatusLayout/PENDING', icon: "hourglass-half", color: backgroundColortwo },
        { title: "Canceled", count: totalJobsCanceled, route: '/jobstatusLayout/CANCELLED', icon: "times-circle", color: backgroundColortwo },
    ]

    return (
        <View className="w-full">
            <View className="flex-row justify-between items-center">
                {jobStats.map((stat, index) => (
                    <React.Fragment key={stat.title}>
                        <TouchableOpacity
                            onPress={() => router.push(stat.route)}
                            activeOpacity={0.7}
                            className="flex-row items-center gap-2.5"
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center"
                                style={{ backgroundColor: stat.color + '20' }}
                            >
                                <FontAwesome5 name={stat.icon} size={18} color={stat.color} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 10, color: secondaryTextColor, opacity: 0.6, fontFamily: 'TTFirsNeue' }}>
                                    {stat.title}
                                </Text>
                                <Text style={{ fontSize: 16, fontFamily: 'TTFirsNeueMedium', color: secondaryTextColor }}>
                                    {stat.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {index < jobStats.length - 1 && (
                            <View
                                className="h-10 w-px"
                                style={{ backgroundColor: secondaryTextColor + '20' }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    )
}
export default JobStatistics