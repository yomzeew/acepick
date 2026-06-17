import {
    Image, ScrollView, Text, TouchableOpacity, View,
    ActivityIndicator, RefreshControl, Alert
} from "react-native"
import ContainerTemplate from "../dashboardComponent/containerTemplate"
import { ThemeText, ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { getColors } from "../../static/color"
import { useTheme } from "../../hooks/useTheme"
import EmptyView from "../emptyview"
import { ReactNode, useState } from "react"
import { Feather, AntDesign, FontAwesome, FontAwesome5, Ionicons } from '../icons'
import { router } from "expo-router"
import RatingStar from "component/rating"
import HeaderComponent from "component/headerComp"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { useQuery } from "@tanstack/react-query"
import { getProfessionalDashboard } from "services/dashboardService"
import { logoutAsync } from "redux/slices/authSlice"
import { deleteUserFn } from "services/userService"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: any): string => {
    const num = Number(n)
    if (!n || isNaN(num)) return '₦0'
    return `₦${num.toLocaleString('en-NG')}`
}

const getAvatarSource = (avatar: string) => {
    if (!avatar || avatar.trim() === '') return require('../../assets/professional.png')
    if (avatar.startsWith('http') || avatar.startsWith('/')) return { uri: avatar }
    return require('../../assets/professional.png')
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileProfessional = () => {
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor, secondaryTextColor, backgroundColor, warningColor, errorColor } = getColors(theme)
    const user = useSelector((state: RootState) => state.auth.user)
    const dispatch = useDispatch()
    const [refreshing, setRefreshing] = useState(false)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['professional-dashboard'],
        queryFn: getProfessionalDashboard,
        select: (res) => res?.data,
    })

    const onRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await dispatch(logoutAsync() as any)
                        router.replace("/loginscreen")
                    },
                },
            ]
        )
    }

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently deleted. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteUserFn()
                            await dispatch(logoutAsync() as any)
                            router.replace("/loginscreen")
                        } catch (error: any) {
                            Alert.alert("Error", "Failed to delete account. Please try again.")
                        }
                    },
                },
            ]
        )
    }

    const profile = data?.profile
    const wallet = data?.wallet
    const professional = data?.professional
    const jobSummary = data?.jobSummary
    const ratings = data?.ratings
    const recentReviews: any[] = data?.recentReviews ?? []

    const avatar = profile?.avatar || user?.profile?.avatar || ''
    const firstName = profile?.firstName || user?.profile?.firstName || ''
    const lastName = profile?.lastName || user?.profile?.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim() || 'Professional'
    const isVerified = profile?.verified || false
    const isOnline = professional?.online ?? professional?.available ?? false
    const profession = professional?.profession?.title ?? ''
    const sector = professional?.profession?.sector?.title ?? ''
    const rate = profile?.rate || ratings?.average || 0
    const ratingCount = ratings?.total || profile?.totalReview || 0
    const balance = wallet?.currentBalance ?? 0
    const totalEarned = professional?.totalEarning ?? 0
    const availableWithdrawal = professional?.availableWithdrawalAmount ?? 0
    const pendingAmount = professional?.pendingAmount ?? 0
    const location = user?.location
        ? `${user.location.lga ?? ''}, ${user.location.state ?? ''}`.replace(/^, |, $/, '')
        : ''

    const disputes = profile?.totalDisputes || jobSummary?.disputed || 0
    const totalReviews = profile?.totalReview || ratingCount || 0

    const JOB_STATS = [
        { label: 'Completed', count: jobSummary?.completed ?? profile?.totalJobsCompleted ?? 0, color: '#22C55E', status: 'COMPLETED', icon: 'check-circle' },
        { label: 'Ongoing', count: jobSummary?.ongoing ?? profile?.totalJobsOngoing ?? 0, color: primaryColor, status: 'ONGOING', icon: 'clock' },
        { label: 'Pending', count: jobSummary?.pending ?? profile?.totalJobsPending ?? 0, color: warningColor, status: 'PENDING', icon: 'hourglass-half' },
        { label: 'Cancelled', count: jobSummary?.cancelled ?? profile?.totalJobsCanceled ?? 0, color: errorColor, status: 'CANCELLED', icon: 'times-circle' },
        { label: 'Declined', count: jobSummary?.declined ?? profile?.totalJobsDeclined ?? 0, color: '#6B7280', status: 'DECLINED', icon: 'ban' },
        { label: 'Disputed', count: disputes, color: errorColor, status: 'DISPUTED', icon: 'exclamation-triangle' },
    ]

    if (isLoading && !data) {
        return (
            <ContainerTemplate>
                <HeaderComponent title="Profile" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <EmptyView height={12}/>
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Loading profile...
                    </ThemeTextsecond>
                </View>
            </ContainerTemplate>
        )
    }

    return (
        <ContainerTemplate>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }}>
                <HeaderComponent title="Profile" />
                <TouchableOpacity
                    onPress={() => router.push('/professionalSettingLayout' as any)}
                    style={{ padding: 8 }}
                >
                    <Feather size={22} color={primaryColor} name="settings" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* ── Hero Card ── */}
                <View
                    style={{
                        backgroundColor: selectioncardColor,
                        borderRadius: 20,
                        padding: 20,
                        marginHorizontal: 2,
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        {/* Avatar */}
                        <View style={{ position: 'relative' }}>
                            <Image
                                source={getAvatarSource(avatar)}
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 36,
                                    borderWidth: 3,
                                    borderColor: primaryColor + '40',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
                                }}
                                resizeMode="cover"
                            />
                            {/* Online dot */}
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    width: 16,
                                    height: 16,
                                    borderRadius: 8,
                                    backgroundColor: isOnline ? '#22C55E' : '#9CA3AF',
                                    borderWidth: 2.5,
                                    borderColor: selectioncardColor,
                                }}
                            />
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <Text
                                    style={{
                                        fontSize: 17,
                                        fontWeight: '700',
                                        color: theme === 'dark' ? '#F9FAFB' : '#111827',
                                        fontFamily: 'TTFirsNeue',
                                        flexShrink: 1,
                                    }}
                                    numberOfLines={1}
                                >
                                    {fullName}
                                </Text>
                                {isVerified ? (
                                    <FontAwesome5 name="check-circle" size={14} color={primaryColor} />
                                ) : null}
                            </View>

                            {profession ? (
                                <Text style={{ fontSize: 12, color: primaryColor, fontFamily: 'TTFirsNeue', fontWeight: '600', marginBottom: 3 }}>
                                    {profession}{sector ? ` · ${sector}` : ''}
                                </Text>
                            ) : null}

                            {location ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                    <FontAwesome5 name="map-marker-alt" size={10} color={secondaryTextColor} />
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                                        {location}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <RatingStar numberOfStars={Math.round(rate)} />
                                <Text style={{ fontSize: 11, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                                    {rate > 0 ? `${Number(rate).toFixed(1)} (${ratingCount})` : 'No ratings yet'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Status badge */}
                    <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                                backgroundColor: isOnline ? '#22C55E15' : '#9CA3AF15',
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 5,
                                borderWidth: 1,
                                borderColor: isOnline ? '#22C55E40' : '#9CA3AF40',
                            }}
                        >
                            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }} />
                            <Text style={{ fontSize: 11, fontWeight: '600', color: isOnline ? '#22C55E' : '#9CA3AF', fontFamily: 'TTFirsNeue' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>

                        {professional?.workType ? (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5,
                                    backgroundColor: primaryColor + '12',
                                    borderRadius: 20,
                                    paddingHorizontal: 12,
                                    paddingVertical: 5,
                                    borderWidth: 1,
                                    borderColor: primaryColor + '30',
                                }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: '600', color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                                    {professional.workType}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <EmptyView height={16} />

                {/* ── Earnings + Wallet ── */}
                <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 2 }}>
                    {/* Wallet */}
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: primaryColor,
                            borderRadius: 16,
                            padding: 16,
                            elevation: 3,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.25,
                            shadowRadius: 6,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'TTFirsNeue' }}>
                                Wallet Balance
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFFFFF', fontFamily: 'TTFirsNeue' }}>
                            {fmt(balance)}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/billhistorylayout' as any)}
                            style={{
                                marginTop: 10,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 8,
                                paddingVertical: 5,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 11, color: '#FFFFFF', fontFamily: 'TTFirsNeue', fontWeight: '600' }}>
                                View History
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Total Earned */}
                    <View style={{ flex: 1, gap: 8 }}>
                        <View
                            style={{
                                backgroundColor: '#22C55E12',
                                borderRadius: 12,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#22C55E25',
                            }}
                        >
                            <Text style={{ fontSize: 10, color: '#22C55E', fontFamily: 'TTFirsNeue', fontWeight: '600', marginBottom: 3 }}>
                                TOTAL EARNED
                            </Text>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#22C55E', fontFamily: 'TTFirsNeue' }}>
                                {fmt(totalEarned)}
                            </Text>
                        </View>

                        <View
                            style={{
                                backgroundColor: '#F59E0B12',
                                borderRadius: 12,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#F59E0B25',
                            }}
                        >
                            <Text style={{ fontSize: 10, color: '#F59E0B', fontFamily: 'TTFirsNeue', fontWeight: '600', marginBottom: 3 }}>
                                WITHDRAWABLE
                            </Text>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B', fontFamily: 'TTFirsNeue' }}>
                                {fmt(availableWithdrawal)}
                            </Text>
                        </View>
                    </View>
                </View>

                <EmptyView height={16} />

                {/* ── Job Stats Grid ── */}
                <View style={{ marginHorizontal: 2 }}>
                    <ThemeText size={Textstyles.text_cmedium} style={{ marginBottom: 10 }}>Job Summary</ThemeText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {JOB_STATS.map((stat) => (
                            <TouchableOpacity
                                key={stat.status}
                                onPress={() => router.push(`/jobstatusLayout/${stat.status}` as any)}
                                style={{
                                    width: '30.5%',
                                    backgroundColor: selectioncardColor,
                                    borderRadius: 14,
                                    padding: 12,
                                    alignItems: 'center',
                                    elevation: 2,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 3,
                                    borderTopWidth: 3,
                                    borderTopColor: stat.color,
                                }}
                                activeOpacity={0.75}
                            >
                                <FontAwesome5 name={stat.icon} size={16} color={stat.color} />
                                <Text style={{ fontSize: 20, fontWeight: '800', color: stat.color, fontFamily: 'TTFirsNeue', marginTop: 6 }}>
                                    {String(stat.count)}
                                </Text>
                                <Text style={{ fontSize: 10, color: secondaryTextColor, fontFamily: 'TTFirsNeue', textAlign: 'center', marginTop: 2 }}>
                                    {stat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <EmptyView height={16} />

                {/* ── Recent Reviews ── */}
                {recentReviews.length > 0 ? (
                    <View style={{ marginHorizontal: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <ThemeText size={Textstyles.text_cmedium}>Recent Reviews</ThemeText>
                            <TouchableOpacity onPress={() => router.push('/reviewlayout' as any)}>
                                <Text style={{ fontSize: 12, color: primaryColor, fontFamily: 'TTFirsNeue', fontWeight: '600' }}>
                                    See all ({totalReviews})
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {recentReviews.map((review: any, idx: number) => {
                            const reviewerName = review.clientUser?.profile
                                ? `${review.clientUser.profile.firstName || ''} ${review.clientUser.profile.lastName || ''}`.trim()
                                : 'Client'
                            const reviewerAvatar = review.clientUser?.profile?.avatar ?? ''
                            return (
                                <View
                                    key={review.id ?? idx}
                                    style={{
                                        backgroundColor: selectioncardColor,
                                        borderRadius: 14,
                                        padding: 14,
                                        marginBottom: 8,
                                        elevation: 2,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 3,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <Image
                                            source={getAvatarSource(reviewerAvatar)}
                                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}
                                            resizeMode="cover"
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '600', color: theme === 'dark' ? '#F9FAFB' : '#111827', fontFamily: 'TTFirsNeue' }}>
                                                {reviewerName}
                                            </Text>
                                            <Text style={{ fontSize: 10, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    {review.text ? (
                                        <Text style={{ fontSize: 13, color: secondaryTextColor, fontFamily: 'TTFirsNeue', lineHeight: 19 }} numberOfLines={3}>
                                            "{review.text}"
                                        </Text>
                                    ) : null}
                                </View>
                            )
                        })}
                    </View>
                ) : null}

                <EmptyView height={16} />

                {/* ── Action Tabs ── */}
                <View style={{ marginHorizontal: 2 }}>
                    <ListTab
                        icon={<FontAwesome name="warning" size={18} color="#EF4444" />}
                        label={`Disputes (${disputes})`}
                        onPress={() => router.push('/jobstatusLayout/DISPUTED' as any)}
                        accent="#EF4444"
                    />
                    <ListTab
                        icon={<FontAwesome name="star" size={18} color="#F59E0B" />}
                        label={`Reviews & Ratings (${totalReviews})`}
                        onPress={() => router.push('/reviewlayout' as any)}
                        accent="#F59E0B"
                    />
                    <ListTab
                        icon={<Feather name="edit-3" size={18} color={primaryColor} />}
                        label="Edit Profile"
                        onPress={() => router.push('/profileeditlayout' as any)}
                        accent={primaryColor}
                    />
                    <ListTab
                        icon={<Ionicons name="swap-horizontal" size={18} color="#6366F1" />}
                        label="Switch Role"
                        onPress={() => router.push('/switch-role' as any)}
                        accent="#6366F1"
                    />
                </View>

                <EmptyView height={16} />

                {/* ── Logout & Delete Account Buttons ── */}
                <View style={{ marginHorizontal: 2, gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={{
                            backgroundColor: '#DC262615',
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                        <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: "600", fontFamily: 'TTFirsNeue' }}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        style={{
                            backgroundColor: '#DC262615',
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        <Text style={{ color: '#DC2626', fontSize: 15, fontWeight: "600", fontFamily: 'TTFirsNeue' }}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ContainerTemplate>
    )
}

export default ProfileProfessional

// ─── ListTab ──────────────────────────────────────────────────────────────────

interface ListTabProps {
    icon: ReactNode
    label: string
    onPress: () => void
    accent?: string
}

export const ListTab = ({ icon, label, onPress, accent }: ListTabProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, secondaryTextColor } = getColors(theme)
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={{
                backgroundColor: selectioncardColor,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                borderLeftWidth: 3,
                borderLeftColor: accent ?? secondaryTextColor,
            }}
        >
            <View style={{ width: 32, alignItems: 'center' }}>{icon}</View>
            <Text
                style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme === 'dark' ? '#F9FAFB' : '#1F2937',
                    fontFamily: 'TTFirsNeue',
                }}
            >
                {label}
            </Text>
            <AntDesign name="right" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
    )
}

// ─── AnalyticDiagram (kept for backward compatibility) ───────────────────────

export const AnalyticDiagram = () => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)

    const { data } = useQuery({
        queryKey: ['professional-dashboard'],
        queryFn: getProfessionalDashboard,
        select: (res) => res?.data,
    })

    const professional = data?.professional
    const totalEarned = professional?.totalEarning ?? 0
    const pendingAmount = professional?.pendingAmount ?? 0

    return (
        <View
            style={{
                backgroundColor: selectioncardColor,
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 2,
                elevation: 3,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                    <ThemeTextsecond size={Textstyles.text_xsma}>Total Earned</ThemeTextsecond>
                    <ThemeText size={Textstyles.text_medium} type="secondary">{`₦${Number(totalEarned).toLocaleString('en-NG')}`}</ThemeText>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <ThemeTextsecond size={Textstyles.text_xsma}>Pending</ThemeTextsecond>
                    <ThemeText size={Textstyles.text_medium} type="secondary">{`₦${Number(pendingAmount).toLocaleString('en-NG')}`}</ThemeText>
                </View>
            </View>
        </View>
    )
}
