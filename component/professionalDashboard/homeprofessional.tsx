import { AntDesign, Feather } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonComponent from "component/buttoncomponent"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/dashboardComponent/headercomponent"
import WalletCard from "component/dashboardComponent/walletcompoment"
import EmptyView from "component/emptyview"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState, useCallback } from "react"
import { Text, TouchableOpacity, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { SaveTokenFunction, updateLocation } from "services/userService"
import { useDashboard } from "hooks/useDashboard"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { formatAmount } from "utilizes/amountFormat"
import TransferFund from "component/menuComponent/walletPages/transferfund"

const HomeComponentProfession = () => {
    const router = useRouter()
    const [showmodal, setshowmodal] = useState(false)
    const [showwithdraw, setshowwithdraw] = useState(false)
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor, secondaryTextColor, borderColor, backgroundColortwo, successColor, errorColor } = getColors(theme)
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const fcmToken = useSelector((state: RootState) => state?.auth.user?.fcmToken)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { data: dashboardData, loading: dashboardLoading, refresh: refreshDashboard } = useDashboard()

    const user = useSelector((state: RootState) => state.auth?.user) ?? null
    const profile = user?.profile
    const professional = profile?.professional
    const { location, address, state, lga } = useCurrentLocation()

    // Derived dashboard data
    const ongoingJobs = (dashboardData as any)?.ongoingJobs || []
    const recentReviews = (dashboardData as any)?.recentReviews || []
    const ratings = (dashboardData as any)?.ratings || { average: 0, total: 0 }
    const recentTransactions = (dashboardData as any)?.recentTransactions || []

    const saveFcmToken = useCallback(async () => {
        try {
            await SaveTokenFunction(fcmToken)
        } catch (error) {
            console.error('SaveTokenUrl error:', error)
        }
    }, [fcmToken])

    const locationMutation = useMutation({
        mutationFn: ({ locationId, data }: { locationId: string; data: any }) => updateLocation(locationId, data),
        onError: (error: any) => {
            setErrorMessage(error?.response?.data?.message || error?.message || "Location update failed")
        },
    })

    const updateLocationFn = useCallback(() => {
        const locationId = user?.location?.id?.toString()
        if (!locationId || !location?.coords) return
        const { latitude, longitude } = location.coords
        locationMutation.mutate({ locationId, data: { latitude, longitude, address, state, lga } })
    }, [user?.location?.id, location, address, state, lga])

    useEffect(() => {
        saveFcmToken()
        updateLocationFn()
    }, [])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        setBalanceRefreshTrigger(prev => !prev)
        refreshDashboard()
        setTimeout(() => setRefreshing(false), 1200)
    }, [refreshDashboard])

    const jobStats = [
        { label: "Completed", count: profile?.totalJobsCompleted || 0, color: primaryColor, icon: "check-circle" as const, iconLib: "feather", route: "/jobstatusLayout/COMPLETED" },
        { label: "In Progress", count: profile?.totalJobsOngoing || 0, color: primaryColor, icon: "loader" as const, iconLib: "feather", route: "/jobstatusLayout/ONGOING" },
        { label: "Pending", count: profile?.totalJobsPending || 0, color: backgroundColortwo, icon: "clock" as const, iconLib: "feather", route: "/jobstatusLayout/PENDING" },
        { label: "Declined", count: profile?.totalJobsDeclined || 0, color: backgroundColortwo, icon: "x-circle" as const, iconLib: "feather", route: "/jobstatusLayout/REJECTED" },
    ]

    const earningsData = [
        { label: "Completed", amount: professional?.completedAmount || 0, icon: "trending-up", color: primaryColor },
        { label: "Pending", amount: professional?.pendingAmount || 0, icon: "clock", color: backgroundColortwo },
        { label: "Withdrawable", amount: professional?.availableWithdrawalAmount || 0, icon: "download", color: primaryColor },
        { label: "Rejected", amount: professional?.rejectedAmount || 0, icon: "x-circle", color: backgroundColortwo },
    ]

    return (
        <>
            <SliderModalTemplate showmodal={showmodal} modalHeight={'60%'} setshowmodal={setshowmodal}>
                <SlideupContent />
            </SliderModalTemplate>
            <SliderModalTemplate showmodal={showwithdraw} modalHeight={'80%'} setshowmodal={setshowwithdraw}>
                <TransferFund setshowmodal={setshowwithdraw} />
            </SliderModalTemplate>

            <ContainerTemplate>
                <HeaderComponent />

                <View className="flex-1">
                    <ScrollView
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    >
                        {/* Verification Banner */}
                        <View className="mt-2 mb-3">
                            <VerificationBadge onPress={() => setshowmodal(true)} />
                        </View>

                        {/* Wallet Card */}
                        <WalletCard
                            setshowmodal={setshowmodal}
                            showmodal={showmodal}
                            refreshTrigger={balanceRefreshTrigger}
                            setshowwithdraw={setshowwithdraw}
                            showwithdraw={showwithdraw}
                        />

                        {/* Job Stats Grid */}
                        <View className="mt-5 mb-2 px-1">
                            <ThemeText size={Textstyles.text_small}>Job Overview</ThemeText>
                            <EmptyView height={10} />
                            <View className="flex-row flex-wrap justify-between">
                                {jobStats.map((stat) => (
                                    <TouchableOpacity
                                        key={stat.label}
                                        onPress={() => router.push(stat.route as any)}
                                        activeOpacity={0.7}
                                        style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1, width: '48%', marginBottom: 10 }}
                                        className="rounded-2xl p-4"
                                    >
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View style={{ backgroundColor: stat.color + '20' }} className="w-10 h-10 rounded-xl items-center justify-center">
                                                <Feather name={stat.icon} size={18} color={stat.color} />
                                            </View>
                                            <Feather name="chevron-right" size={16} color={secondaryTextColor} />
                                        </View>
                                        <Text style={{ fontSize: 28, fontWeight: '700', color: stat.color }}>{stat.count}</Text>
                                        <ThemeTextsecond size={Textstyles.text_xsmall}>{stat.label}</ThemeTextsecond>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Earnings Section */}
                        <View className="mt-3 px-1">
                            <View className="flex-row items-center justify-between mb-3">
                                <ThemeText size={Textstyles.text_small}>Earnings</ThemeText>
                                <View style={{ backgroundColor: primaryColor + '20' }} className="px-3 py-1 rounded-full">
                                    <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>
                                        Total: {formatAmount(professional?.totalEarning || 0)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-4">
                                {earningsData.map((item, index) => (
                                    <View key={item.label}>
                                        <View className="flex-row items-center justify-between py-3">
                                            <View className="flex-row items-center flex-1">
                                                <View style={{ backgroundColor: item.color + '15' }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                                                    <Feather name={item.icon as any} size={16} color={item.color} />
                                                </View>
                                                <ThemeTextsecond size={Textstyles.text_small}>{item.label}</ThemeTextsecond>
                                            </View>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: item.color }}>
                                                {formatAmount(item.amount)}
                                            </Text>
                                        </View>
                                        {index < earningsData.length - 1 && (
                                            <View style={{ backgroundColor: borderColor, height: 1 }} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Jobs In Progress */}
                        <View className="mt-5 px-1">
                            <View className="flex-row items-center justify-between mb-3">
                                <ThemeText size={Textstyles.text_small}>Jobs in Progress</ThemeText>
                                <TouchableOpacity
                                    onPress={() => router.push('/jobstatusLayout/ONGOING')}
                                    style={{ backgroundColor: primaryColor + '15' }}
                                    className="px-3 py-1.5 rounded-full"
                                >
                                    <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            {dashboardLoading && ongoingJobs.length === 0 ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator size="small" color={primaryColor} />
                                </View>
                            ) : ongoingJobs.length === 0 ? (
                                <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-6 items-center">
                                    <Feather name="briefcase" size={32} color={secondaryTextColor} />
                                    <EmptyView height={8} />
                                    <ThemeTextsecond size={Textstyles.text_small}>No jobs in progress</ThemeTextsecond>
                                    <ThemeTextsecond size={Textstyles.text_xsmall}>Active jobs will appear here</ThemeTextsecond>
                                </View>
                            ) : (
                                ongoingJobs.slice(0, 3).map((job: any) => (
                                    <OngoingJobCard
                                        key={job.id}
                                        job={job}
                                        onPress={() => router.push(`/jobdetails/${job.id}` as any)}
                                    />
                                ))
                            )}
                        </View>

                        {/* Ratings & Reviews */}
                        <View className="mt-5 px-1">
                            <View className="flex-row items-center justify-between mb-3">
                                <ThemeText size={Textstyles.text_small}>Ratings & Reviews</ThemeText>
                            </View>
                            <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-4">
                                {/* Rating Summary */}
                                <View className="flex-row items-center mb-4">
                                    <View className="items-center mr-5">
                                        <Text style={{ fontSize: 36, fontWeight: '700', color: primaryColor }}>
                                            {(ratings.average || 0).toFixed(1)}
                                        </Text>
                                        <View className="flex-row mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <AntDesign
                                                    key={star}
                                                    name={star <= Math.round(ratings.average || 0) ? "star" : "staro"}
                                                    size={14}
                                                    color={primaryColor}
                                                    style={{ marginHorizontal: 1 }}
                                                />
                                            ))}
                                        </View>
                                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                                            {ratings.total || 0} reviews
                                        </ThemeTextsecond>
                                    </View>
                                    <View style={{ backgroundColor: borderColor, width: 1, height: 60 }} />
                                    <View className="flex-1 ml-5">
                                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                                            Your rating is visible to clients when they search for professionals.
                                        </ThemeTextsecond>
                                    </View>
                                </View>

                                {/* Recent Reviews */}
                                {recentReviews.length > 0 && (
                                    <>
                                        <View style={{ backgroundColor: borderColor, height: 1, marginBottom: 12 }} />
                                        {recentReviews.map((review: any, index: number) => (
                                            <View key={review.id || index} className="mb-3">
                                                <View className="flex-row items-center mb-1">
                                                    <View style={{ backgroundColor: primaryColor + '20' }} className="w-8 h-8 rounded-full items-center justify-center mr-2">
                                                        <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>
                                                            {(review.clientUser?.profile?.firstName?.[0] || '?').toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-1">
                                                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                                                            {review.clientUser?.profile?.firstName} {review.clientUser?.profile?.lastName}
                                                        </ThemeTextsecond>
                                                    </View>
                                                    <ThemeTextsecond size={{ fontSize: 10 }}>
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </ThemeTextsecond>
                                                </View>
                                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                                    "{review.text}"
                                                </ThemeTextsecond>
                                                {index < recentReviews.length - 1 && (
                                                    <View style={{ backgroundColor: borderColor, height: 1, marginTop: 10 }} />
                                                )}
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Recent Transactions */}
                        {recentTransactions.length > 0 && (
                            <View className="mt-5 px-1">
                                <View className="flex-row items-center justify-between mb-3">
                                    <ThemeText size={Textstyles.text_small}>Recent Transactions</ThemeText>
                                    <TouchableOpacity
                                        onPress={() => router.push('/billhistorylayout')}
                                        style={{ backgroundColor: primaryColor + '15' }}
                                        className="px-3 py-1.5 rounded-full"
                                    >
                                        <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3">
                                    {recentTransactions.slice(0, 4).map((txn: any, index: number) => (
                                        <View key={txn.id}>
                                            <View className="flex-row items-center py-2.5">
                                                <View
                                                    style={{ backgroundColor: (txn.type === 'credit' ? successColor : errorColor) + '20' }}
                                                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                                >
                                                    <Feather
                                                        name={txn.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
                                                        size={16}
                                                        color={txn.type === 'credit' ? successColor : errorColor}
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                                                        {txn.description || (txn.type === 'credit' ? 'Credit' : 'Debit')}
                                                    </ThemeTextsecond>
                                                    <ThemeTextsecond size={{ fontSize: 10 }}>
                                                        {new Date(txn.createdAt).toLocaleDateString()}
                                                    </ThemeTextsecond>
                                                </View>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: txn.type === 'credit' ? successColor : errorColor }}>
                                                    {txn.type === 'credit' ? '+' : '-'}{formatAmount(txn.amount)}
                                                </Text>
                                            </View>
                                            {index < Math.min(recentTransactions.length, 4) - 1 && (
                                                <View style={{ backgroundColor: borderColor, height: 1 }} />
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                    </ScrollView>
                </View>
            </ContainerTemplate>
        </>
    )
}
export default HomeComponentProfession

// ── Ongoing Job Card ────────────────────────────────────────────────
interface OngoingJobCardProps {
    job: any;
    onPress: () => void;
}
const OngoingJobCard = ({ job, onPress }: OngoingJobCardProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, borderColor, primaryColor, secondaryTextColor } = getColors(theme)
    const clientName = job.client?.profile
        ? `${job.client.profile.firstName} ${job.client.profile.lastName}`
        : 'Unknown Client'

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }}
            className="rounded-2xl p-4 mb-2.5"
        >
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                    <ThemeText size={Textstyles.text_small}>{job.title || 'Untitled Job'}</ThemeText>
                    <View className="flex-row items-center mt-1">
                        <Feather name="user" size={12} color={secondaryTextColor} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}> {clientName}</ThemeTextsecond>
                    </View>
                </View>
                <View style={{ backgroundColor: primaryColor + '20' }} className="px-2.5 py-1 rounded-full">
                    <Text style={{ color: primaryColor, fontSize: 11, fontWeight: '600' }}>Ongoing</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center">
                    <Feather name="calendar" size={12} color={secondaryTextColor} />
                    <ThemeTextsecond size={{ fontSize: 11 }}> {new Date(job.createdAt).toLocaleDateString()}</ThemeTextsecond>
                </View>
                {job.total != null && (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: primaryColor }}>
                        {formatAmount(job.total)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}

// ── Verification Badge ──────────────────────────────────────────────
const VerificationBadge = ({ onPress }: { onPress: () => void }) => {
    const { theme } = useTheme()
    const { primaryColor, backgroundColortwo } = getColors(theme)

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
                backgroundColor: '#DC262610',
                borderColor: '#DC262630',
                borderWidth: 1,
            }}
            className="w-full rounded-2xl px-4 py-3"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View
                        style={{ backgroundColor: '#DC2626' }}
                        className="w-9 h-9 rounded-full justify-center items-center"
                    >
                        <AntDesign size={14} name="warning" color="#ffffff" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#DC2626' }}>
                            Verification Required
                        </Text>
                        <Text style={{ fontSize: 11, color: '#DC262699', marginTop: 1 }}>
                            Complete to be visible to clients
                        </Text>
                    </View>
                </View>
                <View style={{ backgroundColor: primaryColor }} className="px-3.5 py-2 rounded-xl">
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Verify</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

// ── Slide-up Content ────────────────────────────────────────────────
const SlideupContent = () => {
    const { theme } = useTheme()
    const { primaryColor, backgroundColortwo } = getColors(theme)
    return (
        <View className="h-full w-full px-5 items-center justify-center">
            <EmptyView height={40} />
            <View style={{ backgroundColor: backgroundColortwo + '20' }} className="w-20 h-20 rounded-full items-center justify-center">
                <AntDesign name="warning" size={36} color={backgroundColortwo} />
            </View>
            <EmptyView height={20} />
            <ThemeText size={Textstyles.text_medium}>Account Not Verified</ThemeText>
            <EmptyView height={8} />
            <ThemeTextsecond size={Textstyles.text_xsmall}>
                <Text style={{ textAlign: 'center' }}>
                    Please activate your account to be visible to clients and start receiving job requests.
                </Text>
            </ThemeTextsecond>
            <EmptyView height={30} />
            <View className="w-full px-3">
                <ButtonComponent
                    color={primaryColor}
                    text="Activate Now"
                    textcolor="#ffffff"
                    onPress={() => null}
                />
            </View>
        </View>
    )
}

