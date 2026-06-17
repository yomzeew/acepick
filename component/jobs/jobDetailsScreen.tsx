import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { getColors } from "static/color"
import { ThemeText } from "component/ThemeText"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/headerComp"
import { JobCard } from "component/jobs/lastestJob"
import { useMutation } from "@tanstack/react-query"
import { fetchInvoice } from "services/userService"
import type { JobProps } from "types/type"
import ProfileSlideupModal from "component/profileSlideupModal"

const JobDetailsScreen = () => {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor } = getColors(theme)
    
    const [job, setJob] = useState<JobProps | null>(null)
    const [loading, setLoading] = useState(true)
    
    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [profileModalData, setProfileModalData] = useState<{
        type: 'professional' | 'client';
        data: JobProps['professional'] | JobProps['client'];
    } | null>(null)

    const jobMutation = useMutation({
        mutationFn: () => fetchInvoice(id as string),
        onSuccess: (response: any) => {
            setJob(response);
            setLoading(false);
        },
        onError: (error: any) => {
            console.error('JobDetailsScreen Error:', error);
            setLoading(false);
        }
    });

    const handleOpenProfile = (data: { type: 'professional' | 'client'; data: JobProps['professional'] | JobProps['client'] }) => {
        setProfileModalData(data);
        setShowProfileModal(true);
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            jobMutation.mutate();
        }
    }, [id]);

    if (loading) {
        return (
            <ContainerTemplate>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={{ color: secondaryTextColor, marginTop: 10 }}>
                        Loading job details...
                    </Text>
                </View>
            </ContainerTemplate>
        );
    }

    if (!job) {
        return (
            <ContainerTemplate>
                <View className="flex-1 justify-center items-center">
                    <Text style={{ color: secondaryTextColor }}>
                        Job not found
                    </Text>
                </View>
            </ContainerTemplate>
        );
    }

    return (
        <>
            <ContainerTemplate>
                <View className="flex-1">
                    <HeaderComponent title="Job Details" />
                    <ScrollView className="flex-1">
                        <JobCard
                            job={job}
                            router={router}
                            onUpdate={() => {}}
                            onApprove={() => {}}
                            onOpenProfile={handleOpenProfile}
                        />
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
    );
};

export default JobDetailsScreen;
