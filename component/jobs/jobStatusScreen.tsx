import { Ionicons } from "@expo/vector-icons"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import HeaderComponent from "component/headerComp"
import SectorSkeletonCard from "component/sectorSkeletonCard"
import { ThemeText } from "component/ThemeText"
import { JobCard } from "component/jobs/lastestJob"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState, useCallback } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { useMutation } from "@tanstack/react-query"
import { getAllJobs } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import type { JobProps } from "types/type"

const JobStatusScreen = () => {
    const { jobstatus } = useLocalSearchParams()
    const status = Array.isArray(jobstatus) ? jobstatus[0] : jobstatus ?? ''
    const router = useRouter()
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)

    const [jobs, setJobs] = useState<JobProps[]>([])
    const [refreshing, setRefreshing] = useState(false)

    const fetchMutation = useMutation({
        mutationFn: getAllJobs,
        onSuccess: (res) => setJobs(res.data),
        onSettled: () => setRefreshing(false),
    })

    const loadJobs = useCallback(() => {
        setRefreshing(true)
        const qs = status ? `status=${encodeURIComponent(status)}` : null
        fetchMutation.mutate(qs)
    }, [status])

    useEffect(loadJobs, [status])

    const label = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() + ' Jobs'
        : 'All Jobs'

    return (
        <ContainerTemplate>
            <View className="flex-1">
                <HeaderComponent title={label} />
                <EmptyView height={12} />

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadJobs} />}
                    showsVerticalScrollIndicator={false}
                >
                    {fetchMutation.isPending && !refreshing ? (
                        [...Array(3)].map((_, i) => <SectorSkeletonCard key={i} />)
                    ) : jobs.length ? (
                        jobs.map((j) => (
                            <JobCard
                                key={j.id}
                                job={j}
                                onUpdate={() => {}}
                                onApprove={() => {}}
                                router={router}
                            />
                        ))
                    ) : (
                        <View className="items-center justify-center py-20">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: primaryColor + '12' }}
                            >
                                <Ionicons name="briefcase-outline" size={36} color={primaryColor} />
                            </View>
                            <ThemeText size={Textstyles.text_cmedium}>No {status?.toLowerCase()} jobs</ThemeText>
                            <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                                Pull down to refresh
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </ContainerTemplate>
    )
}
export default JobStatusScreen