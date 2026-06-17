import React, { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Linking,
    StatusBar,
    StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { useQuery } from "@tanstack/react-query"
import { generalUserDetailFn, addChatContactFn } from "services/userService"
import { getReviewsForUserUrl } from "utilizes/endpoints"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { getInitials } from "utilizes/initialsName"
import BackComponent from "component/backcomponent"
import axios from "axios"
import { store } from "redux/store"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationEntry {
    state?: string
    lga?: string
}

interface DeliveryInfo {
    id: number | string
    vehicleType?: string
    licensePlate?: string
    available?: boolean
    yearsOfExp?: number
    totalEarning?: number
    completedAmount?: string
    online?: boolean
}

interface RiderData {
    userId: string
    firstName: string
    lastName: string
    avatar?: string
    role?: string
    email?: string
    phone?: string
    verified?: boolean
    bvnVerified?: boolean
    rate?: string
    totalReview?: number
    totalJobs?: number
    totalJobsCompleted?: number
    totalJobsCanceled?: number
    totalDisputes?: number
    createdAt?: string
    delivery?: DeliveryInfo
    location?: LocationEntry[]
}

interface ReviewUser {
    id: string
    profile?: {
        firstName?: string
        lastName?: string
        avatar?: string
    }
}

interface Review {
    id: number | string
    text?: string
    comment?: string
    rating?: number
    createdAt?: string
    reviewer?: ReviewUser
    clientUser?: ReviewUser
    raterUser?: ReviewUser
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarUri = (avatar?: string): { uri: string } | null => {
    if (avatar && (avatar.startsWith("http") || avatar.startsWith("/"))) {
        return { uri: avatar }
    }
    return null
}

const formatMemberSince = (dateStr?: string): string => {
    if (!dateStr) return "N/A"
    try {
        return new Date(dateStr).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    } catch {
        return "N/A"
    }
}

const formatReviewDate = (dateStr?: string): string => {
    if (!dateStr) return ""
    try {
        return new Date(dateStr).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    } catch {
        return ""
    }
}

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => {
    const filled = Math.round(rating)
    return (
        <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                    key={i}
                    name={i <= filled ? "star" : "star-outline"}
                    size={size}
                    color="#F59E0B"
                />
            ))}
        </View>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const RiderProfile = () => {
    const { theme } = useTheme()
    const { primaryColor } = getColors(theme)
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const params = useLocalSearchParams()

    const isDark = theme === "dark"
    const textPrimary = isDark ? "#F9FAFB" : "#111827"
    const mutedText = isDark ? "#9CA3AF" : "#6B7280"
    const cardBg = isDark ? "#1F2937" : "#FFFFFF"
    const divider = isDark ? "#374151" : "#E5E7EB"
    const headerBg = primaryColor

    const userId = String(params.id || "")

    // ── Profile query ──────────────────────────────────────────────────────────

    const {
        data: profileData,
        isLoading,
        error,
        refetch,
    } = useQuery<RiderData | null>({
        queryKey: ["riderProfile", userId],
        queryFn: async () => {
            const res = await generalUserDetailFn(userId)
            return (res?.data ?? res) as RiderData
        },
        enabled: !!userId,
        retry: 2,
    })

    // ── Reviews query ──────────────────────────────────────────────────────────

    const { data: reviews } = useQuery<Review[]>({
        queryKey: ["riderReviews", userId],
        queryFn: async () => {
            const token = store.getState().auth?.token
            const res = await axios.get(getReviewsForUserUrl(userId), {
                headers: { Authorization: `Bearer ${token}` },
            })
            const list = res.data?.data ?? res.data ?? []
            return Array.isArray(list) ? list : []
        },
        enabled: !!userId,
        retry: 1,
    })

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleCall = () => {
        const phone = profileData?.phone
        if (!phone) return
        const name = `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim()
        Alert.alert("Call Rider", `Call ${name} at ${phone}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Call", onPress: () => Linking.openURL(`tel:${phone}`) },
        ])
    }

    const handleMessage = async () => {
        const uid = profileData?.userId
        if (!uid) return
        try {
            await addChatContactFn(uid)
        } catch {}
        router.push(
            `/(Authenticated)/(chatcallmessage)/mainchat/${JSON.stringify({ userId: uid })}` as any
        )
    }

    // ── Guard states ───────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <View style={[styles.centerFill, { backgroundColor: isDark ? "#111827" : "#FAF8F8" }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.loadingText, { color: mutedText }]}>Loading profile…</Text>
            </View>
        )
    }

    if (error || !profileData) {
        return (
            <View
                style={[
                    styles.centerFill,
                    { backgroundColor: isDark ? "#111827" : "#FAF8F8", padding: 24 },
                ]}
            >
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                <View
                    style={[
                        styles.errorIconWrap,
                        { backgroundColor: "#EF444420" },
                    ]}
                >
                    <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                </View>
                <Text style={[styles.errorTitle, { color: textPrimary }]}>Failed to Load</Text>
                <Text style={[styles.errorBody, { color: mutedText }]}>
                    {error instanceof Error
                        ? error.message
                        : "Unable to load rider profile"}
                </Text>
                <View style={styles.errorButtons}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.errorBtn, { borderColor: divider }]}
                    >
                        <Text style={[styles.errorBtnText, { color: textPrimary }]}>Go Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={[styles.errorBtn, { backgroundColor: primaryColor, borderColor: primaryColor }]}
                    >
                        <Text style={[styles.errorBtnText, { color: "#fff" }]}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    // ── Derived values ─────────────────────────────────────────────────────────

    const firstName = profileData.firstName ?? ""
    const lastName = profileData.lastName ?? ""
    const fullName = `${firstName} ${lastName}`.trim() || "Rider"
    const initials = getInitials({ firstName, lastName })
    const avatarSource = getAvatarUri(profileData.avatar)

    const isOnline = profileData.delivery?.online ?? false
    const isAvailable = profileData.delivery?.available ?? false

    const rating = parseFloat(profileData.rate ?? "0") || 0
    const totalReview = profileData.totalReview ?? 0
    const totalCompleted = profileData.totalJobsCompleted ?? 0

    const locationParts = (profileData.location ?? [])
        .flatMap((l) => [l.lga, l.state].filter(Boolean))
    const locationStr = locationParts.length > 0 ? locationParts.slice(0, 2).join(", ") : null

    const vehicleType = profileData.delivery?.vehicleType
    const licensePlate = profileData.delivery?.licensePlate
    const yearsOfExp = profileData.delivery?.yearsOfExp
    const memberSince = formatMemberSince(profileData.createdAt)

    const displayedReviews = (reviews ?? []).slice(0, 5)

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <View style={[styles.root, { backgroundColor: isDark ? "#111827" : "#FAF8F8" }]}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

                {/* ════════ HERO HEADER ════════ */}
                <View
                    style={[
                        styles.header,
                        { backgroundColor: headerBg, paddingTop: insets.top + 12 },
                    ]}
                >
                    {/* Top row: back + online badge */}
                    <View style={styles.headerTopRow}>
                        <BackComponent bordercolor="#ffffff" textcolor="#ffffff" />
                        {isOnline && (
                            <View style={styles.onlineBadge}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineBadgeText}>Online</Text>
                            </View>
                        )}
                    </View>

                    {/* Avatar area */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarRing}>
                            {avatarSource ? (
                                <Image
                                    source={avatarSource}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.avatar, styles.initialsCircle]}>
                                    <Text style={styles.initialsText}>{initials}</Text>
                                </View>
                            )}
                            {/* Online dot */}
                            <View
                                style={[
                                    styles.onlineDotIndicator,
                                    {
                                        backgroundColor: isOnline ? "#22C55E" : "#9CA3AF",
                                        borderColor: headerBg,
                                    },
                                ]}
                            />
                            {/* Verified badge */}
                            {profileData.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={22} color={primaryColor} />
                                </View>
                            )}
                        </View>

                        {/* Name */}
                        <Text style={styles.fullName}>{fullName}</Text>

                        {/* Role badge */}
                        <View style={styles.roleBadgeRow}>
                            <Ionicons name="bicycle" size={14} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.roleBadgeText}>Delivery Rider</Text>
                        </View>

                        {/* Verified + BVN badges */}
                        {(profileData.verified || profileData.bvnVerified) && (
                            <View style={styles.badgesRow}>
                                {profileData.verified && (
                                    <View style={styles.headerBadge}>
                                        <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" />
                                        <Text style={styles.headerBadgeText}>Verified</Text>
                                    </View>
                                )}
                                {profileData.bvnVerified && (
                                    <View style={styles.headerBadge}>
                                        <Ionicons name="card-outline" size={11} color="#FFFFFF" />
                                        <Text style={styles.headerBadgeText}>BVN Verified</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Availability pill */}
                        <View style={[styles.availPill, { marginTop: 12 }]}>
                            <View
                                style={[
                                    styles.availDot,
                                    { backgroundColor: isAvailable ? "#22C55E" : "#9CA3AF" },
                                ]}
                            />
                            <Text style={styles.availText}>
                                {isAvailable ? "Available for delivery" : "Busy"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ════════ STATS ROW ════════ */}
                <View
                    style={[
                        styles.statsRow,
                        { backgroundColor: cardBg, borderBottomColor: divider },
                    ]}
                >
                    {[
                        {
                            label: "Deliveries",
                            value: String(totalCompleted),
                            icon: "checkmark-circle" as const,
                            color: "#22C55E",
                        },
                        {
                            label: "Rating",
                            value: rating.toFixed(1) + " ⭐",
                            icon: "star" as const,
                            color: "#F59E0B",
                        },
                        {
                            label: "Reviews",
                            value: String(totalReview),
                            icon: "chatbubbles" as const,
                            color: primaryColor,
                        },
                    ].map((stat, i, arr) => (
                        <View
                            key={stat.label}
                            style={[
                                styles.statBox,
                                {
                                    borderRightWidth: i < arr.length - 1 ? 1 : 0,
                                    borderRightColor: divider,
                                },
                            ]}
                        >
                            <Ionicons name={stat.icon} size={18} color={stat.color} />
                            <Text style={[styles.statValue, { color: stat.color }]}>
                                {stat.value}
                            </Text>
                            <Text style={[styles.statLabel, { color: mutedText }]}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ════════ ACTION BUTTONS ════════ */}
                <View
                    style={[
                        styles.actionsBar,
                        { backgroundColor: cardBg, borderBottomColor: divider },
                    ]}
                >
                    {profileData.phone ? (
                        <TouchableOpacity
                            onPress={handleCall}
                            activeOpacity={0.8}
                            style={[
                                styles.actionBtn,
                                {
                                    flex: 1,
                                    borderColor: isDark ? "#4B5563" : "#E5E7EB",
                                    backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                                },
                            ]}
                        >
                            <Ionicons name="call-outline" size={17} color={primaryColor} />
                            <Text style={[styles.actionBtnText, { color: primaryColor }]}>Call</Text>
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                        onPress={handleMessage}
                        activeOpacity={0.8}
                        style={[
                            styles.actionBtn,
                            {
                                flex: 1,
                                borderColor: isDark ? "#4B5563" : "#E5E7EB",
                                backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
                            },
                        ]}
                    >
                        <Ionicons name="chatbubble-outline" size={17} color={primaryColor} />
                        <Text style={[styles.actionBtnText, { color: primaryColor }]}>Message</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 20 }}>

                    {/* ════════ INFO CARD ════════ */}
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: cardBg,
                                borderColor: divider,
                            },
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
                            Rider Details
                        </Text>

                        <View style={styles.infoList}>
                            {locationStr ? (
                                <InfoRow
                                    icon="location-outline"
                                    label={locationStr}
                                    primaryColor={primaryColor}
                                    mutedText={mutedText}
                                />
                            ) : null}

                            {vehicleType ? (
                                <InfoRow
                                    icon="bicycle"
                                    label={
                                        vehicleType +
                                        (licensePlate ? ` · ${licensePlate}` : "")
                                    }
                                    primaryColor={primaryColor}
                                    mutedText={mutedText}
                                />
                            ) : null}

                            {yearsOfExp ? (
                                <InfoRow
                                    icon="time-outline"
                                    label={`${yearsOfExp} year${yearsOfExp !== 1 ? "s" : ""} of experience`}
                                    primaryColor={primaryColor}
                                    mutedText={mutedText}
                                />
                            ) : null}

                            <InfoRow
                                icon="calendar-outline"
                                label={`Member since ${memberSince}`}
                                primaryColor={primaryColor}
                                mutedText={mutedText}
                            />
                        </View>
                    </View>

                    {/* ════════ REVIEWS ════════ */}
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: cardBg,
                                borderColor: divider,
                            },
                        ]}
                    >
                        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
                            Reviews
                        </Text>

                        {displayedReviews.length === 0 ? (
                            <View style={styles.emptyReviews}>
                                <Ionicons name="star-outline" size={36} color={mutedText} />
                                <Text style={[styles.emptyReviewsText, { color: mutedText }]}>
                                    No reviews yet
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.reviewList}>
                                {displayedReviews.map((review, index) => {
                                    const reviewer =
                                        review.reviewer ?? review.clientUser ?? review.raterUser
                                    const reviewerFirst =
                                        reviewer?.profile?.firstName ?? "User"
                                    const reviewerLast =
                                        reviewer?.profile?.lastName ?? ""
                                    const reviewerName =
                                        `${reviewerFirst} ${reviewerLast}`.trim()
                                    const reviewerAvatar = reviewer?.profile?.avatar
                                    const reviewerInitials = getInitials({
                                        firstName: reviewerFirst,
                                        lastName: reviewerLast,
                                    })
                                    const commentText =
                                        review.comment ?? review.text ?? ""
                                    const stars = review.rating ?? 0

                                    return (
                                        <View
                                            key={review.id ?? index}
                                            style={[
                                                styles.reviewItem,
                                                {
                                                    borderTopColor:
                                                        index === 0 ? "transparent" : divider,
                                                    borderTopWidth: index === 0 ? 0 : 1,
                                                },
                                            ]}
                                        >
                                            {/* Reviewer avatar */}
                                            <View style={styles.reviewAvatarWrap}>
                                                {reviewerAvatar &&
                                                (reviewerAvatar.startsWith("http") ||
                                                    reviewerAvatar.startsWith("/")) ? (
                                                    <Image
                                                        source={{ uri: reviewerAvatar }}
                                                        style={styles.reviewAvatar}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View
                                                        style={[
                                                            styles.reviewAvatar,
                                                            styles.reviewInitialsCircle,
                                                            { backgroundColor: primaryColor + "25" },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.reviewInitialsText,
                                                                { color: primaryColor },
                                                            ]}
                                                        >
                                                            {reviewerInitials || "U"}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Review body */}
                                            <View style={styles.reviewBody}>
                                                <View style={styles.reviewHeader}>
                                                    <Text
                                                        style={[
                                                            styles.reviewerName,
                                                            { color: textPrimary },
                                                        ]}
                                                    >
                                                        {reviewerName}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.reviewDate,
                                                            { color: mutedText },
                                                        ]}
                                                    >
                                                        {formatReviewDate(review.createdAt)}
                                                    </Text>
                                                </View>
                                                {stars > 0 && <StarRow rating={stars} />}
                                                {commentText ? (
                                                    <Text
                                                        style={[
                                                            styles.reviewText,
                                                            { color: mutedText },
                                                        ]}
                                                    >
                                                        {commentText}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

const InfoRow = ({
    icon,
    label,
    primaryColor,
    mutedText,
}: {
    icon: React.ComponentProps<typeof Ionicons>["name"]
    label: string
    primaryColor: string
    mutedText: string
}) => (
    <View style={styles.infoRow}>
        <View style={[styles.infoIconWrap, { backgroundColor: primaryColor + "18" }]}>
            <Ionicons name={icon} size={15} color={primaryColor} />
        </View>
        <Text style={[styles.infoLabel, { color: mutedText }]}>{label}</Text>
    </View>
)

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    centerFill: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 14,
        fontFamily: "TTFirsNeue",
        marginTop: 14,
    },
    errorIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "TTFirsNeueMedium",
        textAlign: "center",
    },
    errorBody: {
        fontSize: 14,
        fontFamily: "TTFirsNeue",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    errorButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    errorBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    errorBtnText: {
        fontWeight: "600",
        fontFamily: "TTFirsNeue",
        fontSize: 14,
    },

    // Header
    header: {
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        minHeight: 40,
    },
    onlineBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(34,197,94,0.22)",
        borderRadius: 20,
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "rgba(34,197,94,0.45)",
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#22C55E",
    },
    onlineBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "TTFirsNeue",
    },

    // Avatar
    avatarContainer: {
        alignItems: "center",
    },
    avatarRing: {
        position: "relative",
        marginBottom: 14,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.45)",
    },
    initialsCircle: {
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    initialsText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#FFFFFF",
        fontFamily: "TTFirsNeueMedium",
    },
    onlineDotIndicator: {
        position: "absolute",
        bottom: 3,
        right: 3,
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2.5,
    },
    verifiedBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    fullName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        fontFamily: "TTFirsNeueMedium",
        textAlign: "center",
        marginBottom: 6,
    },
    roleBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    roleBadgeText: {
        fontSize: 13,
        color: "rgba(255,255,255,0.92)",
        fontFamily: "TTFirsNeue",
        fontWeight: "600",
    },
    badgesRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    headerBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 20,
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },
    headerBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "TTFirsNeue",
    },
    availPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.28)",
    },
    availDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    availText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "TTFirsNeue",
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
    },
    statBox: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
    },
    statValue: {
        fontSize: 17,
        fontWeight: "800",
        fontFamily: "TTFirsNeueMedium",
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: "TTFirsNeue",
        marginTop: 2,
    },

    // Actions
    actionsBar: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: "700",
        fontFamily: "TTFirsNeue",
    },

    // Cards
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "TTFirsNeueMedium",
        marginBottom: 14,
        letterSpacing: 0.2,
    },

    // Info rows
    infoList: {
        gap: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    infoIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: "TTFirsNeue",
        flex: 1,
        lineHeight: 20,
    },

    // Reviews
    emptyReviews: {
        alignItems: "center",
        paddingVertical: 28,
    },
    emptyReviewsText: {
        fontSize: 14,
        fontFamily: "TTFirsNeue",
        marginTop: 10,
    },
    reviewList: {
        gap: 0,
    },
    reviewItem: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 14,
    },
    reviewAvatarWrap: {
        flexShrink: 0,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewInitialsCircle: {
        justifyContent: "center",
        alignItems: "center",
    },
    reviewInitialsText: {
        fontSize: 15,
        fontWeight: "700",
        fontFamily: "TTFirsNeueMedium",
    },
    reviewBody: {
        flex: 1,
        gap: 4,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "TTFirsNeueMedium",
    },
    reviewDate: {
        fontSize: 11,
        fontFamily: "TTFirsNeue",
    },
    reviewText: {
        fontSize: 13,
        fontFamily: "TTFirsNeue",
        lineHeight: 19,
        marginTop: 2,
    },
    starRow: {
        flexDirection: "row",
        gap: 2,
    },
})

export default RiderProfile
