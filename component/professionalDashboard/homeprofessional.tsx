import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonComponent from "component/buttoncomponent"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/dashboardComponent/headercomponent"
import WalletCard from "component/dashboardComponent/walletcompoment"
import EmptyView from "component/emptyview"
import SliderModalTemplate from "component/slideupModalTemplate"
import VerificationBadge from "component/controls/verificationBadge"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { useBVNVerification } from "hooks/useBVNVerification"
import { useEffect, useState, useCallback } from "react"
import {
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
    Image,
} from "react-native"
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
    const {
        primaryColor,
        selectioncardColor,
        secondaryTextColor,
        borderColor,
        backgroundColortwo,
        successColor,
        errorColor,
        backgroundColor,
        subText,
    } = getColors(theme)
    const isDark = theme === "dark"
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const fcmToken = useSelector((state: RootState) => state?.auth.user?.fcmToken)
    const { data: dashboardData, loading: dashboardLoading, refresh: refreshDashboard } = useDashboard()
    const { isVerified: isBVNVerified, isLoading: bvnLoading } = useBVNVerification()

    const user = useSelector((state: RootState) => state.auth?.user) ?? null
    const profile = user?.profile
    const professional = profile?.professional
    const { location, address, state: locationState, lga } = useCurrentLocation()

    const ongoingJobs = (dashboardData as any)?.ongoingJobs || []
    const recentReviews = (dashboardData as any)?.recentReviews || []
    const ratings = (dashboardData as any)?.ratings || { average: 0, total: 0 }
    const recentTransactions = (dashboardData as any)?.recentTransactions || []

    const completionRate = (() => {
        const total = (profile?.totalJobsCompleted || 0) + (profile?.totalJobsDeclined || 0)
        if (total === 0) return 0
        return Math.round(((profile?.totalJobsCompleted || 0) / total) * 100)
    })()

    const saveFcmToken = useCallback(async () => {
        try { await SaveTokenFunction(fcmToken) } catch {}
    }, [fcmToken])

    const locationMutation = useMutation({
        mutationFn: ({ locationId, data }: { locationId: string; data: any }) =>
            updateLocation(locationId, data),
    })

    const updateLocationFn = useCallback(() => {
        const locationId = user?.location?.id?.toString()
        if (!locationId || !location?.coords) return
        const { latitude, longitude } = location.coords
        locationMutation.mutate({ locationId, data: { latitude, longitude, address, state: locationState, lga } })
    }, [user?.location?.id, location, address, locationState, lga])

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

    // ── Data configs ────────────────────────────────────────────────
    const jobStats = [
        { label: "Completed", count: profile?.totalJobsCompleted || 0, icon: "check-circle" as const, color: successColor, route: "/jobstatusLayout/COMPLETED" },
        { label: "In Progress", count: profile?.totalJobsOngoing || 0, icon: "loader" as const, color: primaryColor, route: "/jobstatusLayout/ONGOING" },
        { label: "Pending", count: profile?.totalJobsPending || 0, icon: "clock" as const, color: backgroundColortwo, route: "/jobstatusLayout/PENDING" },
        { label: "Declined", count: profile?.totalJobsDeclined || 0, icon: "x-circle" as const, color: errorColor, route: "/jobstatusLayout/REJECTED" },
    ]

    const earningsData = [
        { label: "Total Earned", amount: professional?.totalEarning || 0, icon: "trending-up" as const, color: successColor },
        { label: "Completed", amount: professional?.completedAmount || 0, icon: "check-circle" as const, color: primaryColor },
        { label: "Withdrawable", amount: professional?.availableWithdrawalAmount || 0, icon: "download" as const, color: backgroundColortwo },
        { label: "Pending", amount: professional?.pendingAmount || 0, icon: "clock" as const, color: backgroundColortwo },
    ]

    const cardBg = isDark ? "#1F2937" : "#FFFFFF"
    const cardBorder = isDark ? "#374151" : "#E5E7EB"

    return (
        <>
            <SliderModalTemplate showmodal={showmodal} modalHeight="60%" setshowmodal={setshowmodal}>
                <SlideupContent />
            </SliderModalTemplate>
            <SliderModalTemplate showmodal={showwithdraw} modalHeight="80%" setshowmodal={setshowwithdraw}>
                <TransferFund setshowmodal={setshowwithdraw} />
            </SliderModalTemplate>

            <ContainerTemplate>
                <HeaderComponent showSettings={true} />

                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* ── Verification Banner ── */}
                    {!bvnLoading ? (
                        <View style={{ marginBottom: 12 }}>
                            <VerificationBadge
                                isVerified={isBVNVerified}
                                onPress={() => !isBVNVerified && router.push("/bvnActivation")}
                                size="medium"
                            />
                        </View>
                    ) : (
                        <View style={styles.verifyLoader}>
                            <ActivityIndicator size="small" color={primaryColor} />
                            <Text style={[styles.verifyText, { color: subText }]}>Checking verification...</Text>
                        </View>
                    )}

                    {/* ── Wallet ── */}
                    <WalletCard
                        setshowmodal={setshowmodal}
                        showmodal={showmodal}
                        refreshTrigger={balanceRefreshTrigger}
                        setshowwithdraw={setshowwithdraw}
                        showwithdraw={showwithdraw}
                    />

                    {/* ── Performance strip ── */}
                    <View style={[styles.perfStrip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <PerfPill label="Rating" value={`${(ratings.average || 0).toFixed(1)}★`} color={primaryColor} subText={subText} />
                        <View style={[styles.perfDivider, { backgroundColor: cardBorder }]} />
                        <PerfPill label="Reviews" value={`${ratings.total || 0}`} color={backgroundColortwo} subText={subText} />
                        <View style={[styles.perfDivider, { backgroundColor: cardBorder }]} />
                        <PerfPill label="Completion" value={`${completionRate}%`} color={successColor} subText={subText} />
                    </View>

                    {/* ── Job Stats ── */}
                    <SectionHeader
                        title="Job Overview"
                        action={{ label: "All Jobs", onPress: () => router.push("/jobstatusLayout/ONGOING" as any) }}
                        primaryColor={primaryColor}
                        subText={subText}
                    />
                    <View style={styles.statsGrid}>
                        {jobStats.map((stat) => (
                            <TouchableOpacity
                                key={stat.label}
                                onPress={() => router.push(stat.route as any)}
                                activeOpacity={0.75}
                                style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                            >
                                <View style={[styles.statIcon, { backgroundColor: stat.color + "18" }]}>
                                    <Feather name={stat.icon} size={18} color={stat.color} />
                                </View>
                                <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
                                <Text style={[styles.statLabel, { color: subText }]}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Earnings ── */}
                    <SectionHeader title="Earnings" primaryColor={primaryColor} subText={subText} />
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        {earningsData.map((item, i) => (
                            <View key={item.label}>
                                <View style={styles.earningsRow}>
                                    <View style={[styles.earningsIcon, { backgroundColor: item.color + "18" }]}>
                                        <Feather name={item.icon} size={15} color={item.color} />
                                    </View>
                                    <Text style={[styles.earningsLabel, { color: subText }]}>{item.label}</Text>
                                    <Text style={[styles.earningsAmount, { color: item.color }]}>
                                        {formatAmount(item.amount)}
                                    </Text>
                                </View>
                                {i < earningsData.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: cardBorder }]} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* ── Jobs In Progress ── */}
                    <SectionHeader
                        title="Jobs in Progress"
                        action={{ label: "See All", onPress: () => router.push("/jobstatusLayout/ONGOING" as any) }}
                        primaryColor={primaryColor}
                        subText={subText}
                    />

                    {dashboardLoading && ongoingJobs.length === 0 ? (
                        <View style={styles.emptyCenter}>
                            <ActivityIndicator color={primaryColor} />
                        </View>
                    ) : ongoingJobs.length === 0 ? (
                        <EmptyCard
                            icon="briefcase"
                            title="No jobs in progress"
                            subtitle="Active jobs will appear here"
                            cardBg={cardBg}
                            cardBorder={cardBorder}
                            subText={subText}
                        />
                    ) : (
                        ongoingJobs.slice(0, 3).map((job: any) => (
                            <OngoingJobCard
                                key={job.id}
                                job={job}
                                onPress={() => router.push(`/jobdetailsLayout/${job.id}` as any)}
                                primaryColor={primaryColor}
                                cardBg={cardBg}
                                cardBorder={cardBorder}
                                subText={subText}
                            />
                        ))
                    )}

                    {/* ── Ratings & Reviews ── */}
                    <SectionHeader title="Ratings & Reviews" primaryColor={primaryColor} subText={subText} />
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        {/* Summary row */}
                        <View style={styles.ratingsSummary}>
                            <View style={styles.ratingsBig}>
                                <Text style={[styles.ratingNumber, { color: primaryColor }]}>
                                    {(ratings.average || 0).toFixed(1)}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <AntDesign
                                            key={s}
                                            name={s <= Math.round(ratings.average || 0) ? "star" : "staro"}
                                            size={13}
                                            color={primaryColor}
                                            style={{ marginHorizontal: 1 }}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.reviewCount, { color: subText }]}>
                                    {ratings.total || 0} reviews
                                </Text>
                            </View>
                            <View style={[styles.ratingsVDivider, { backgroundColor: cardBorder }]} />
                            <View style={styles.ratingsRight}>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const pct = ratings.total
                                        ? Math.round(((ratings[`star${star}`] || 0) / ratings.total) * 100)
                                        : 0
                                    return (
                                        <View key={star} style={styles.barRow}>
                                            <Text style={[styles.barLabel, { color: subText }]}>{star}</Text>
                                            <View style={[styles.barTrack, { backgroundColor: cardBorder }]}>
                                                <View style={[styles.barFill, { backgroundColor: primaryColor, width: `${pct}%` as any }]} />
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>

                        {/* Recent reviews */}
                        {recentReviews.length > 0 && (
                            <>
                                <View style={[styles.divider, { backgroundColor: cardBorder, marginVertical: 14 }]} />
                                {recentReviews.map((review: any, i: number) => (
                                    <View key={review.id || i} style={{ marginBottom: i < recentReviews.length - 1 ? 14 : 0 }}>
                                        <View style={styles.reviewHeader}>
                                            {review.clientUser?.profile?.avatar ? (
                                                <Image
                                                    source={{ uri: review.clientUser.profile.avatar }}
                                                    style={[styles.reviewAvatar, { borderColor: primaryColor + "40" }]}
                                                />
                                            ) : (
                                                <View style={[styles.reviewAvatarFallback, { backgroundColor: primaryColor + "20" }]}>
                                                    <Text style={[styles.reviewInitial, { color: primaryColor }]}>
                                                        {(review.clientUser?.profile?.firstName?.[0] || "?").toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.reviewName, { color: subText }]}>
                                                    {review.clientUser?.profile?.firstName} {review.clientUser?.profile?.lastName}
                                                </Text>
                                                <View style={styles.reviewStars}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <AntDesign
                                                            key={s}
                                                            name={s <= (review.rating || 0) ? "star" : "staro"}
                                                            size={11}
                                                            color={primaryColor}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={[styles.reviewDate, { color: subText }]}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {review.text ? (
                                            <Text style={[styles.reviewText, { color: subText }]}>"{review.text}"</Text>
                                        ) : null}
                                        {i < recentReviews.length - 1 && (
                                            <View style={[styles.divider, { backgroundColor: cardBorder, marginTop: 12 }]} />
                                        )}
                                    </View>
                                ))}
                            </>
                        )}

                        {recentReviews.length === 0 && (
                            <View style={styles.emptyCenter}>
                                <Feather name="message-square" size={28} color={subText} />
                                <Text style={[styles.emptyTitle, { color: subText }]}>No reviews yet</Text>
                            </View>
                        )}
                    </View>

                    {/* ── Recent Transactions ── */}
                    {recentTransactions.length > 0 && (
                        <>
                            <SectionHeader
                                title="Recent Transactions"
                                action={{ label: "View All", onPress: () => router.push("/billhistorylayout") }}
                                primaryColor={primaryColor}
                                subText={subText}
                            />
                            <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                                {recentTransactions.slice(0, 5).map((txn: any, i: number) => (
                                    <View key={txn.id}>
                                        <View style={styles.txnRow}>
                                            <View style={[styles.txnIcon, {
                                                backgroundColor: (txn.type === "credit" ? successColor : errorColor) + "18",
                                            }]}>
                                                <Feather
                                                    name={txn.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                                                    size={15}
                                                    color={txn.type === "credit" ? successColor : errorColor}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.txnDesc, { color: subText }]} numberOfLines={1}>
                                                    {txn.description || (txn.type === "credit" ? "Credit" : "Debit")}
                                                </Text>
                                                <Text style={[styles.txnDate, { color: subText }]}>
                                                    {new Date(txn.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <Text style={[styles.txnAmount, {
                                                color: txn.type === "credit" ? successColor : errorColor,
                                            }]}>
                                                {txn.type === "credit" ? "+" : "-"}{formatAmount(txn.amount)}
                                            </Text>
                                        </View>
                                        {i < Math.min(recentTransactions.length, 5) - 1 && (
                                            <View style={[styles.divider, { backgroundColor: cardBorder }]} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            </ContainerTemplate>
        </>
    )
}

export default HomeComponentProfession

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionHeader = ({
    title,
    action,
    primaryColor,
    subText,
}: {
    title: string
    action?: { label: string; onPress: () => void }
    primaryColor: string
    subText: string
}) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: subText }]}>{title}</Text>
        {action && (
            <TouchableOpacity
                onPress={action.onPress}
                style={[styles.sectionAction, { backgroundColor: primaryColor + "18" }]}
            >
                <Text style={[styles.sectionActionText, { color: primaryColor }]}>{action.label}</Text>
            </TouchableOpacity>
        )}
    </View>
)

const PerfPill = ({ label, value, color, subText }: { label: string; value: string; color: string; subText: string }) => (
    <View style={styles.perfPill}>
        <Text style={[styles.perfValue, { color }]}>{value}</Text>
        <Text style={[styles.perfLabel, { color: subText }]}>{label}</Text>
    </View>
)

const EmptyCard = ({
    icon,
    title,
    subtitle,
    cardBg,
    cardBorder,
    subText,
}: {
    icon: any; title: string; subtitle: string
    cardBg: string; cardBorder: string; subText: string
}) => (
    <View style={[styles.card, styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Feather name={icon} size={30} color={subText} />
        <Text style={[styles.emptyTitle, { color: subText }]}>{title}</Text>
        <Text style={[styles.emptySubtitle, { color: subText }]}>{subtitle}</Text>
    </View>
)

interface OngoingJobCardProps {
    job: any
    onPress: () => void
    primaryColor: string
    cardBg: string
    cardBorder: string
    subText: string
}
const OngoingJobCard = ({ job, onPress, primaryColor, cardBg, cardBorder, subText }: OngoingJobCardProps) => {
    const clientName = job.client?.profile
        ? `${job.client.profile.firstName} ${job.client.profile.lastName}`
        : "Unknown Client"

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.jobCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
            {/* Left accent bar */}
            <View style={[styles.jobAccentBar, { backgroundColor: primaryColor }]} />

            <View style={{ flex: 1 }}>
                <View style={styles.jobCardTop}>
                    <Text style={[styles.jobTitle, { color: subText }]} numberOfLines={1}>
                        {job.title || "Untitled Job"}
                    </Text>
                    <View style={[styles.jobBadge, { backgroundColor: primaryColor + "18" }]}>
                        <Text style={[styles.jobBadgeText, { color: primaryColor }]}>Ongoing</Text>
                    </View>
                </View>

                <View style={styles.jobMeta}>
                    <View style={styles.jobMetaItem}>
                        <Feather name="user" size={11} color={subText} />
                        <Text style={[styles.jobMetaText, { color: subText }]}>{clientName}</Text>
                    </View>
                    <View style={styles.jobMetaItem}>
                        <Feather name="calendar" size={11} color={subText} />
                        <Text style={[styles.jobMetaText, { color: subText }]}>
                            {new Date(job.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {job.total != null && (
                    <Text style={[styles.jobAmount, { color: primaryColor }]}>
                        {formatAmount(job.total)}
                    </Text>
                )}
            </View>

            <Feather name="chevron-right" size={16} color={subText} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
    )
}

const SlideupContent = () => {
    const { theme } = useTheme()
    const { primaryColor, backgroundColortwo } = getColors(theme)
    return (
        <View style={styles.slideup}>
            <EmptyView height={40} />
            <View style={[styles.slideupIcon, { backgroundColor: backgroundColortwo + "20" }]}>
                <AntDesign name="warning" size={36} color={backgroundColortwo} />
            </View>
            <EmptyView height={20} />
            <ThemeText size={Textstyles.text_medium}>Account Not Verified</ThemeText>
            <EmptyView height={8} />
            <ThemeTextsecond size={Textstyles.text_xsmall}>
                <Text style={{ textAlign: "center" }}>
                    Please activate your account to be visible to clients and start receiving job requests.
                </Text>
            </ThemeTextsecond>
            <EmptyView height={30} />
            <View style={{ width: "100%", paddingHorizontal: 12 }}>
                <ButtonComponent color={primaryColor} text="Activate Now" textcolor="#ffffff" onPress={() => null} />
            </View>
        </View>
    )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    verifyLoader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, marginBottom: 8 },
    verifyText: { fontSize: 12, marginLeft: 8, fontFamily: "TTFirsNeue" },

    perfStrip: {
        flexDirection: "row", alignItems: "center", borderRadius: 16,
        borderWidth: 1, marginTop: 14, marginBottom: 2, paddingVertical: 14,
    },
    perfPill: { flex: 1, alignItems: "center" },
    perfValue: { fontSize: 18, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
    perfLabel: { fontSize: 11, fontFamily: "TTFirsNeue", marginTop: 2 },
    perfDivider: { width: 1, height: 36 },

    sectionHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        marginTop: 22, marginBottom: 10, paddingHorizontal: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
    sectionAction: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    sectionActionText: { fontSize: 12, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },

    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    statCard: {
        width: "48%", borderRadius: 18, borderWidth: 1,
        padding: 16, alignItems: "flex-start",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    statIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    statCount: { fontSize: 30, fontWeight: "800", fontFamily: "TTFirsNeueMedium", lineHeight: 34 },
    statLabel: { fontSize: 12, fontFamily: "TTFirsNeue", marginTop: 3 },

    card: {
        borderRadius: 20, borderWidth: 1, padding: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    divider: { height: 1 },

    earningsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    earningsIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 12 },
    earningsLabel: { flex: 1, fontSize: 14, fontFamily: "TTFirsNeue" },
    earningsAmount: { fontSize: 15, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },

    jobCard: {
        flexDirection: "row", alignItems: "center", borderRadius: 18,
        borderWidth: 1, padding: 14, marginBottom: 10, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    jobAccentBar: { width: 4, height: "100%", borderRadius: 4, marginRight: 12, position: "absolute", left: 0, top: 0, bottom: 0 },
    jobCardTop: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
    jobTitle: { flex: 1, fontSize: 14, fontWeight: "600", fontFamily: "TTFirsNeueMedium", marginRight: 8 },
    jobBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    jobBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
    jobMeta: { flexDirection: "row", gap: 14, marginTop: 6, marginLeft: 8 },
    jobMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    jobMetaText: { fontSize: 11, fontFamily: "TTFirsNeue" },
    jobAmount: { fontSize: 15, fontWeight: "700", fontFamily: "TTFirsNeueMedium", marginTop: 6, marginLeft: 8 },

    emptyCard: { alignItems: "center", paddingVertical: 28 },
    emptyCenter: { alignItems: "center", paddingVertical: 20 },
    emptyTitle: { fontSize: 14, fontFamily: "TTFirsNeueMedium", marginTop: 8, fontWeight: "600" },
    emptySubtitle: { fontSize: 12, fontFamily: "TTFirsNeue", marginTop: 4 },

    ratingsSummary: { flexDirection: "row", alignItems: "center", paddingBottom: 4 },
    ratingsBig: { alignItems: "center", paddingRight: 16, minWidth: 90 },
    ratingNumber: { fontSize: 40, fontWeight: "800", fontFamily: "TTFirsNeueMedium", lineHeight: 44 },
    starsRow: { flexDirection: "row", marginTop: 4 },
    reviewCount: { fontSize: 11, fontFamily: "TTFirsNeue", marginTop: 4 },
    ratingsVDivider: { width: 1, height: 70 },
    ratingsRight: { flex: 1, paddingLeft: 16, gap: 5 },
    barRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    barLabel: { fontSize: 11, fontFamily: "TTFirsNeue", width: 10 },
    barTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
    barFill: { height: 5, borderRadius: 3 },

    reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    reviewAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5 },
    reviewAvatarFallback: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    reviewInitial: { fontSize: 14, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
    reviewName: { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
    reviewStars: { flexDirection: "row", gap: 2, marginTop: 2 },
    reviewDate: { fontSize: 10, fontFamily: "TTFirsNeue" },
    reviewText: { fontSize: 13, fontFamily: "TTFirsNeue", lineHeight: 19, paddingLeft: 46, fontStyle: "italic" },

    txnRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11 },
    txnIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 12 },
    txnDesc: { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },
    txnDate: { fontSize: 11, fontFamily: "TTFirsNeue", marginTop: 2 },
    txnAmount: { fontSize: 13, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },

    slideup: { flex: 1, width: "100%", paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
    slideupIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
})
