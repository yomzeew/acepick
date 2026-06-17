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
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import ProfileSlideupModal from "component/profileSlideupModal"

const JobStatusScreen = () => {
    const { jobstatus } = useLocalSearchParams()
    const status = Array.isArray(jobstatus) ? jobstatus[0] : jobstatus ?? ''
    const router = useRouter()
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme)
    
    // Get user role and ID for role-based display
    const userRole = useSelector((state: RootState) => state.auth?.user?.role)
    const userId = useSelector((state: RootState) => state.auth?.user?.id)
    const isClient = userRole === 'client'
    const isProfessional = userRole === 'artisan' || userRole === 'corperate' || userRole === 'professional'
    const isDelivery = userRole === 'delivery'

    const [jobs, setJobs] = useState<JobProps[]>([])
    const [refreshing, setRefreshing] = useState(false)
    
    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [profileModalData, setProfileModalData] = useState<{
        type: 'professional' | 'client';
        data: JobProps['professional'] | JobProps['client'];
    } | null>(null)

    const fetchMutation = useMutation({
        mutationFn: getAllJobs,
        onSuccess: (res) => {
            // Filter jobs based on user role
            const filteredJobs = res.data?.filter((job: JobProps) => {
                if (isClient) {
                    // Clients see jobs they created
                    return job.clientId === userId
                } else if (isProfessional) {
                    // Professionals see jobs assigned to them
                    return job.professionalId === userId
                } else if (isDelivery) {
                    // Delivery personnel see delivery jobs (if applicable)
                    // Note: JobProps doesn't have delivery fields yet, so show all for now
                    return true
                }
                return false
            }) || []
            
            // Further filter by status if specified
            const statusFilteredJobs = status 
                ? filteredJobs.filter((job: JobProps) => job.status === status.toUpperCase())
                : filteredJobs
                
            setJobs(statusFilteredJobs)
        },
        onSettled: () => setRefreshing(false),
    })

    const loadJobs = useCallback(() => {
        setRefreshing(true)
        const qs = status ? `status=${encodeURIComponent(status)}` : null
        fetchMutation.mutate(qs)
    }, [status])

    useEffect(loadJobs, [status])

    // Get role-specific label and description
    const getRoleSpecificInfo = () => {
        if (isClient) {
            return {
                title: status ? `${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} Jobs` : 'My Jobs',
                subtitle: 'Jobs you have requested and their status',
                emptyMessage: status ? `No ${status.toLowerCase()} jobs found` : 'No jobs requested yet',
                emptyHint: 'Request a service to see your jobs here'
            }
        } else if (isProfessional) {
            return {
                title: status ? `${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} Jobs` : 'My Jobs',
                subtitle: 'Jobs assigned to you and their progress',
                emptyMessage: status ? `No ${status.toLowerCase()} jobs found` : 'No jobs assigned yet',
                emptyHint: 'Available jobs will appear here when assigned'
            }
        } else if (isDelivery) {
            return {
                title: status ? `${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} Deliveries` : 'My Deliveries',
                subtitle: 'Delivery assignments and their status',
                emptyMessage: status ? `No ${status.toLowerCase()} deliveries found` : 'No deliveries assigned yet',
                emptyHint: 'Delivery assignments will appear here'
            }
        }
        return {
            title: 'Jobs',
            subtitle: 'Job listings and status',
            emptyMessage: 'No jobs found',
            emptyHint: 'Pull down to refresh'
        }
    }

    const roleInfo = getRoleSpecificInfo()

    const handleOpenProfile = (data: { type: 'professional' | 'client'; data: JobProps['professional'] | JobProps['client'] }) => {
        setProfileModalData(data);
        setShowProfileModal(true);
    }

    return (
        <>
            <ContainerTemplate>
                <View className="flex-1">
                    <HeaderComponent title={roleInfo.title} />
                    <EmptyView height={12} />
                    
                    {/* Role-specific subtitle */}
                    <View className="px-4 mb-4">
                        <ThemeText size={Textstyles.text_xsmall} type="secondary" className="text-center">
                            {roleInfo.subtitle}
                        </ThemeText>
                    </View>

                    <ScrollView
                        className="flex-1"
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
                                    onOpenProfile={handleOpenProfile}
                                    router={router}
                                />
                            ))
                        ) : (
                            <View className="items-center justify-center py-20">
                                <View
                                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                    style={{ backgroundColor: primaryColor + '12' }}
                                >
                                    <Ionicons 
                                        name={isDelivery ? "bicycle-outline" : "briefcase-outline"} 
                                        size={36} 
                                        color={primaryColor} 
                                    />
                                </View>
                                <ThemeText size={Textstyles.text_cmedium}>
                                    {roleInfo.emptyMessage}
                                </ThemeText>
                                <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                                    {roleInfo.emptyHint}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ContainerTemplate>
            
            {/* Profile Modal */}
            {showProfileModal && (
                <ProfileSlideupModal
                    isVisible={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    profileData={profileModalData}
                />
            )}
        </>
    )
}
export default JobStatusScreen