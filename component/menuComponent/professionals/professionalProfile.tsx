import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Share,
    Linking,
    StatusBar,
} from "react-native"
import { Ionicons, FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { useQuery } from "@tanstack/react-query"
import { getProfessionDetailFn, getProfessionDetailFnBYUserID, addChatContactFn } from "services/userService"
import RatingStar from "component/rating"
import RatingDisplay from "component/rating/RatingDisplay"
import BackComponent from "component/backcomponent"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfessionalData {
    id: number
    available: boolean
    availableWithdrawalAmount: string
    avgRating: number
    chargeFrom: string
    completedAmount: string
    createdAt: string
    file: string | null
    intro: string
    language: string
    numRating: number
    online: boolean
    pendingAmount: string
    profession: {
        id: number
        image: string
        sector: any
        sectorId: number
        title: string
    }
    professionId: number
    profile: {
        avatar: string
        birthDate: string | null
        bvn: string | null
        bvnVerified: boolean
        certifications: Array<{
            id: number
            name: string
            issuer: string
            date: string
            credentialId?: string
        }>
        count: number
        createdAt: string
        education: Array<{
            id: number
            institution: string
            degree: string
            field: string
            startDate: string
            endDate?: string
        }>
        experience: Array<{
            id: number
            company: string
            position: string
            startDate: string
            endDate?: string
            description: string
        }>
        fcmToken: string | null
        firstName: string
        id: number
        lastName: string
        notified: boolean
        portfolios: Array<{
            id: number
            title: string
            description: string
            images: string[]
            completedAt: string
        }>
        position: string | null
        rate: string
        store: boolean
        switch: boolean
        totalDisputes: number
        totalExpense: number
        totalJobs: number
        totalJobsApproved: number
        totalJobsCanceled: number
        totalJobsCompleted: number
        totalJobsDeclined: number
        totalJobsOngoing: number
        totalJobsPending: number
        totalReview: number
        updatedAt: string
        user: {
            id: string
            email: string
            phone: string
            status: string
            role: string
            createdAt: string
            updatedAt: string
            location: {
                id: number
                address: string
                lga: string
                state: string
                latitude: number
                longitude: number
                zipcode: string
            }
            professionalReviews?: Array<{
                id: number
                text: string
                professionalUserId: string
                clientUserId: string
                createdAt: string
                updatedAt: string
                clientUser: {
                    id: string
                    email: string
                    phone: string
                    status: string
                    role: string
                    profile: {
                        id: number
                        firstName: string
                        lastName: string
                        birthDate: string
                        avatar?: string
                    }
                }
            }>
        }
        userId: string
        verified: boolean
    }
    profileId: number
    regNum: string | null
    rejectedAmount: string
    totalEarning: number
    updatedAt: string
    workType: string
    yearsOfExp: number
}

type TabKey = 'overview' | 'experience' | 'portfolio' | 'reviews'

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview',    label: 'Overview',    icon: 'person-outline'   },
    { key: 'experience',  label: 'Experience',  icon: 'briefcase-outline' },
    { key: 'portfolio',   label: 'Portfolio',   icon: 'images-outline'   },
    { key: 'reviews',     label: 'Reviews',     icon: 'star-outline'     },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarSource = (avatar?: string) => {
    if (avatar && (avatar.startsWith('http') || avatar.startsWith('/'))) return { uri: avatar }
    return require('../../../assets/professional.png')
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfessionalProfile = () => {
    const { theme } = useTheme()
    const {
        primaryColor,
        secondaryTextColor,
        backgroundColor,
        selectioncardColor,
        backgroundColortwo,
        borderColor,
        successColor,
    } = getColors(theme)

    const isDark = theme === 'dark'
    const textPrimary = isDark ? '#F9FAFB' : '#111827'
    const mutedText  = isDark ? '#9CA3AF' : '#6B7280'
    const cardBg     = isDark ? '#374151' : '#FFFFFF'
    const divider    = isDark ? '#4B5563' : '#E5E7EB'
    const headerBg   = primaryColor

    const params = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<TabKey>('overview')

    // byUser=1 means the ID is a user ID → use the /user/:id endpoint
    const byUser = params.byUser === '1'
    const rawIdParam = String(params.professionalId || params.id || '')
    // For professional entity IDs, coerce to number; for user IDs (including UUIDs), keep as-is
    const numericId = Number(rawIdParam)
    const isNumeric = !isNaN(numericId) && numericId > 0
    const professionalId = isNumeric ? numericId : 0
    const isInvalidId = !rawIdParam || (!byUser && !isNumeric)

    const { data, isLoading, error, refetch } = useQuery<ProfessionalData>({
        queryKey: ['professionalDetail', rawIdParam, byUser],
        queryFn: () => byUser ? getProfessionDetailFnBYUserID(rawIdParam) : getProfessionDetailFn(numericId),
        enabled: !isInvalidId,
        retry: 2,
    })

    // ── handlers ──────────────────────────────────────────────────────────────

    const handleJobRequest = () => {
        if (!data) return
        const userId = data.profile?.user?.id
        if (!userId) {
            Alert.alert('Error', 'Unable to create job request. User information not found.')
            return
        }
        const fullName = `${data.profile.firstName} ${data.profile.lastName}`
        const avatar   = data.profile.avatar || ''
        const rating   = data.avgRating || 0
        router.push(
            `/joborderLayout?professionalId=${userId}&avatar=${encodeURIComponent(avatar)}&fullName=${encodeURIComponent(fullName)}&rating=${rating}` as any
        )
    }

    const handleShare = async () => {
        if (!data) return
        const fullName = `${data.profile.firstName} ${data.profile.lastName}`
        try {
            await Share.share({
                message: `Check out ${fullName}, a ${data.profession?.title} with ${(data.avgRating || 0).toFixed(1)} ⭐ on AcePick!`,
                title: `${fullName}'s Profile`,
            })
        } catch {}
    }

    const handleCall = () => {
        const phone = data?.profile?.user?.phone
        if (!phone) return
        Alert.alert(
            'Call Professional',
            `Call ${data.profile.firstName} at ${phone}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
            ]
        )
    }

    const handleMessage = async () => {
        const userId = data?.profile?.userId
        if (!userId) return
        try { await addChatContactFn(userId) } catch {}
        router.push(
            `/(Authenticated)/(chatcallmessage)/mainchat/${JSON.stringify({ userId, professionalId: '' })}` as any
        )
    }

    const handleMore = () => {
        Alert.alert('More Options', undefined, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share Profile', onPress: handleShare },
            { text: 'Report Professional', onPress: () => Alert.alert('Report', 'Report functionality coming soon!') },
        ])
    }

    // ── guard states ──────────────────────────────────────────────────────────

    if (isInvalidId) {
        return (
            <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: primaryColor + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="person-outline" size={40} color={primaryColor} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, fontFamily: 'TTFirsNeue', textAlign: 'center' }}>
                    Profile Unavailable
                </Text>
                <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                    The professional ID provided is not valid.
                </Text>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(Authenticated)/(dashboard)/homelayout' as any)}
                    style={{ marginTop: 24, backgroundColor: primaryColor, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 }}
                >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: 'TTFirsNeue' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', marginTop: 14 }}>
                    Loading profile…
                </Text>
            </View>
        )
    }

    if (error || !data) {
        return (
            <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF444420', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, fontFamily: 'TTFirsNeue', textAlign: 'center' }}>
                    Failed to Load
                </Text>
                <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                    {error instanceof Error ? error.message : 'Unable to load professional profile'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: divider }}
                    >
                        <Text style={{ color: textPrimary, fontWeight: '600', fontFamily: 'TTFirsNeue' }}>Go Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: primaryColor }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600', fontFamily: 'TTFirsNeue' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    // ── derived values ────────────────────────────────────────────────────────

    const fullName   = `${data.profile?.firstName ?? ''} ${data.profile?.lastName ?? ''}`.trim() || 'Professional'
    const profession = data.profession?.title ?? 'Professional'
    const sector     = data.profession?.sector?.title ?? ''
    const location   = [data.profile?.user?.location?.lga, data.profile?.user?.location?.state].filter(Boolean).join(', ') || 'Nigeria'
    const rating     = data.avgRating ?? 0
    const numRating  = data.numRating ?? 0
    const isOnline   = data.online ?? data.available ?? false
    const isAvail    = data.available ?? false
    const yearsExp   = data.yearsOfExp
    const chargeFrom = data.chargeFrom
    const language   = data.language

    // ─── render ───────────────────────────────────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ════════ HERO HEADER ════════ */}
                <View style={{ backgroundColor: headerBg, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 }}>
                    {/* back + share row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <BackComponent bordercolor="#ffffff" textcolor="#ffffff" />
                        <TouchableOpacity
                            onPress={handleShare}
                            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <FontAwesome5 name="share-alt" size={15} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* avatar + name */}
                    <View style={{ alignItems: 'center' }}>
                        {/* Avatar */}
                        <View style={{ position: 'relative', marginBottom: 14 }}>
                            <Image
                                source={getAvatarSource(data.profile?.avatar)}
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 48,
                                    borderWidth: 3,
                                    borderColor: 'rgba(255,255,255,0.4)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                                resizeMode="cover"
                            />
                            {/* Online dot */}
                            <View style={{
                                position: 'absolute',
                                bottom: 2, right: 2,
                                width: 18, height: 18, borderRadius: 9,
                                backgroundColor: isOnline ? '#22C55E' : '#9CA3AF',
                                borderWidth: 2.5,
                                borderColor: headerBg,
                            }} />
                            {/* Verified badge */}
                            {data.profile?.verified && (
                                <View style={{
                                    position: 'absolute',
                                    top: -2, right: -2,
                                    width: 22, height: 22, borderRadius: 11,
                                    backgroundColor: '#FFFFFF',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
                                </View>
                            )}
                        </View>

                        {/* Name */}
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF', fontFamily: 'TTFirsNeue', textAlign: 'center', marginBottom: 4 }}>
                            {fullName}
                        </Text>

                        {/* Profession · Sector */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <FontAwesome5 name="toolbox" size={12} color="rgba(255,255,255,0.8)" />
                            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily: 'TTFirsNeue', fontWeight: '600' }}>
                                {profession}{sector ? ` · ${sector}` : ''}
                            </Text>
                            {yearsExp ? (
                                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'TTFirsNeue' }}>
                                    · {yearsExp}y exp
                                </Text>
                            ) : null}
                        </View>

                        {/* Location */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.75)" />
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'TTFirsNeue' }}>
                                {location}
                            </Text>
                        </View>

                        {/* Rating row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <RatingStar numberOfStars={Math.round(rating)} />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF', fontFamily: 'TTFirsNeue' }}>
                                {rating.toFixed(1)}
                            </Text>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'TTFirsNeue' }}>
                                ({numRating} reviews)
                            </Text>
                        </View>

                        {/* Badges row */}
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center', gap: 5,
                                backgroundColor: 'rgba(255,255,255,0.18)',
                                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.35)',
                            }}>
                                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isAvail ? '#22C55E' : '#9CA3AF' }} />
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', fontFamily: 'TTFirsNeue' }}>
                                    {isAvail ? 'Available' : 'Busy'}
                                </Text>
                            </View>

                            {chargeFrom && (
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', fontFamily: 'TTFirsNeue' }}>
                                        ₦{Number(chargeFrom).toLocaleString('en-NG')}+
                                    </Text>
                                </View>
                            )}

                            {language && (
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                                }}>
                                    <Ionicons name="language-outline" size={12} color="#FFFFFF" />
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF', fontFamily: 'TTFirsNeue' }}>
                                        {language}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* ════════ ACTION BUTTONS ════════ */}
                <View style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: divider }}>
                    {/* Primary CTA */}
                    <TouchableOpacity
                        onPress={handleJobRequest}
                        style={{
                            backgroundColor: primaryColor,
                            borderRadius: 14,
                            paddingVertical: 14,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            marginBottom: 10,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.35,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <FontAwesome5 name="paper-plane" size={15} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', fontFamily: 'TTFirsNeue' }}>
                            Send Job Request
                        </Text>
                    </TouchableOpacity>

                    {/* Secondary row */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {data.profile?.user?.phone ? (
                            <ActionChip icon="call-outline" label="Call" onPress={handleCall} colors={{ primaryColor, divider, isDark }} />
                        ) : null}
                        <ActionChip icon="chatbubble-outline" label="Message" onPress={handleMessage} colors={{ primaryColor, divider, isDark }} />
                        <ActionChip icon="ellipsis-horizontal-outline" label="More" onPress={handleMore} colors={{ primaryColor, divider, isDark }} />
                    </View>
                </View>

                {/* ════════ STATS STRIP ════════ */}
                <View style={{ backgroundColor: cardBg, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: divider }}>
                    {[
                        { label: 'Rating', value: rating.toFixed(1), icon: 'star', color: '#F59E0B' },
                        { label: 'Reviews', value: String(numRating), icon: 'chatbubbles', color: primaryColor },
                        { label: 'Jobs', value: String(data.profile?.totalJobsCompleted ?? 0), icon: 'checkmark-circle', color: '#22C55E' },
                    ].map((stat, i, arr) => (
                        <View
                            key={stat.label}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 14,
                                borderRightWidth: i < arr.length - 1 ? 1 : 0,
                                borderRightColor: divider,
                            }}
                        >
                            <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                            <Text style={{ fontSize: 18, fontWeight: '800', color: stat.color, fontFamily: 'TTFirsNeue', marginTop: 4 }}>
                                {stat.value}
                            </Text>
                            <Text style={{ fontSize: 11, color: mutedText, fontFamily: 'TTFirsNeue' }}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ════════ TABS ════════ */}
                <View style={{ backgroundColor: cardBg, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: divider }}>
                    <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 14, padding: 4 }}>
                        {TABS.map((tab) => {
                            const active = activeTab === tab.key
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    activeOpacity={0.8}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 8,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        backgroundColor: active ? primaryColor : 'transparent',
                                        shadowColor: active ? primaryColor : 'transparent',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: active ? 0.4 : 0,
                                        shadowRadius: 4,
                                        elevation: active ? 3 : 0,
                                    }}
                                >
                                    <Ionicons
                                        name={tab.icon as any}
                                        size={16}
                                        color={active ? '#ffffff' : mutedText}
                                    />
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: '700',
                                        color: active ? '#ffffff' : mutedText,
                                        fontFamily: 'TTFirsNeue',
                                        marginTop: 3,
                                        letterSpacing: 0.2,
                                    }}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                {/* ════════ TAB CONTENT ════════ */}
                <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
                    <TabContent
                        data={data}
                        activeTab={activeTab}
                        colors={{ primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo, divider, mutedText, cardBg, textPrimary }}
                        isDark={isDark}
                    />
                </View>

            </ScrollView>
        </View>
    )
}

// ─── ActionChip ──────────────────────────────────────────────────────────────

const ActionChip = ({
    icon, label, onPress,
    colors: { primaryColor, divider, isDark }
}: {
    icon: string
    label: string
    onPress: () => void
    colors: { primaryColor: string; divider: string; isDark: boolean }
}) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: isDark ? '#4B5563' : '#E5E7EB',
            backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
        }}
    >
        <Ionicons name={icon as any} size={16} color={primaryColor} />
        <Text style={{ color: primaryColor, fontSize: 12, fontWeight: '700', fontFamily: 'TTFirsNeue' }}>
            {label}
        </Text>
    </TouchableOpacity>
)

// ─── TabContent ───────────────────────────────────────────────────────────────

interface TabColors {
    primaryColor: string
    secondaryTextColor: string
    selectioncardColor: string
    backgroundColortwo: string
    divider: string
    mutedText: string
    cardBg: string
    textPrimary: string
}

const TabContent = ({
    data, activeTab, colors, isDark
}: {
    data: ProfessionalData
    activeTab: TabKey
    colors: TabColors
    isDark: boolean
}) => {
    const { primaryColor, selectioncardColor, mutedText, cardBg, textPrimary, divider } = colors

    // ── OVERVIEW ──────────────────────────────────────────────────────────────
    if (activeTab === 'overview') {
        return (
            <View>
                {/* About */}
                {data.intro ? (
                    <Section title="About" isDark={isDark} textPrimary={textPrimary}>
                        <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', lineHeight: 22 }}>
                            {data.intro}
                        </Text>
                    </Section>
                ) : null}

                {/* Professional Details */}
                <Section title="Professional Details" isDark={isDark} textPrimary={textPrimary}>
                    <View style={{ gap: 12 }}>
                        <DetailRow icon="toolbox" label={data.profession?.title || 'N/A'} primaryColor={primaryColor} mutedText={mutedText} />
                        <DetailRow icon="map-marker-alt" label={[data.profile?.user?.location?.lga, data.profile?.user?.location?.state].filter(Boolean).join(', ') || 'Nigeria'} primaryColor={primaryColor} mutedText={mutedText} />
                        {data.yearsOfExp ? <DetailRow icon="clock" label={`${data.yearsOfExp} years of experience`} primaryColor={primaryColor} mutedText={mutedText} /> : null}
                        {data.language ? <DetailRow icon="language" label={`Speaks ${data.language}`} primaryColor={primaryColor} mutedText={mutedText} faType="ionicon" /> : null}
                        {data.chargeFrom ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: primaryColor + '15', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, color: primaryColor, fontWeight: '700' }}>₦</Text>
                                </View>
                                <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue' }}>
                                    Starts from ₦{Number(data.chargeFrom).toLocaleString('en-NG')}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </Section>

                {/* Job Performance */}
                <Section title="Job Performance" isDark={isDark} textPrimary={textPrimary}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {[
                            { label: 'Completed', value: data.profile?.totalJobsCompleted ?? 0, color: '#22C55E' },
                            { label: 'Ongoing',   value: data.profile?.totalJobsOngoing   ?? 0, color: primaryColor },
                            { label: 'Pending',   value: data.profile?.totalJobsPending   ?? 0, color: '#F59E0B' },
                            { label: 'Cancelled', value: data.profile?.totalJobsCanceled  ?? 0, color: '#EF4444' },
                        ].map((s) => (
                            <View key={s.label} style={{
                                flex: 1, minWidth: '40%',
                                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                borderRadius: 14, padding: 14, alignItems: 'center',
                                borderTopWidth: 3, borderTopColor: s.color,
                            }}>
                                <Text style={{ fontSize: 24, fontWeight: '800', color: s.color, fontFamily: 'TTFirsNeue' }}>
                                    {s.value}
                                </Text>
                                <Text style={{ fontSize: 12, color: mutedText, fontFamily: 'TTFirsNeue', marginTop: 4 }}>
                                    {s.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Section>
            </View>
        )
    }

    // ── EXPERIENCE ────────────────────────────────────────────────────────────
    if (activeTab === 'experience') {
        const experiences = data.profile?.experience ?? []
        const education   = data.profile?.education   ?? []

        return (
            <View>
                <Section title="Work Experience" isDark={isDark} textPrimary={textPrimary}>
                    {experiences.length > 0 ? (
                        <View style={{ gap: 10 }}>
                            {experiences.map((exp, i) => (
                                <View key={exp.id} style={{
                                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                    borderRadius: 14, padding: 16,
                                    borderLeftWidth: 3, borderLeftColor: primaryColor,
                                }}>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, fontFamily: 'TTFirsNeue', marginBottom: 3 }}>
                                        {exp.position}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: primaryColor, fontFamily: 'TTFirsNeue', fontWeight: '600', marginBottom: 6 }}>
                                        {exp.company}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: mutedText, fontFamily: 'TTFirsNeue', marginBottom: 8 }}>
                                        {exp.startDate} – {exp.endDate ?? 'Present'}
                                    </Text>
                                    {exp.description ? (
                                        <Text style={{ fontSize: 13, color: mutedText, fontFamily: 'TTFirsNeue', lineHeight: 19 }}>
                                            {exp.description}
                                        </Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <EmptyState icon="briefcase-outline" text="No work experience added yet" mutedText={mutedText} />
                    )}
                </Section>

                <Section title="Education" isDark={isDark} textPrimary={textPrimary}>
                    {education.length > 0 ? (
                        <View style={{ gap: 10 }}>
                            {education.map((edu) => (
                                <View key={edu.id} style={{
                                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                    borderRadius: 14, padding: 16,
                                    borderLeftWidth: 3, borderLeftColor: '#6366F1',
                                }}>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, fontFamily: 'TTFirsNeue', marginBottom: 3 }}>
                                        {edu.degree} in {edu.field}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#6366F1', fontFamily: 'TTFirsNeue', fontWeight: '600', marginBottom: 6 }}>
                                        {edu.institution}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: mutedText, fontFamily: 'TTFirsNeue' }}>
                                        {edu.startDate} – {edu.endDate ?? 'Present'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <EmptyState icon="school-outline" text="No education added yet" mutedText={mutedText} />
                    )}
                </Section>
            </View>
        )
    }

    // ── PORTFOLIO ─────────────────────────────────────────────────────────────
    if (activeTab === 'portfolio') {
        const portfolios = data.profile?.portfolios ?? []

        return (
            <Section title="Portfolio" isDark={isDark} textPrimary={textPrimary}>
                {portfolios.length > 0 ? (
                    <View style={{ gap: 10 }}>
                        {portfolios.map((item) => (
                            <View key={item.id} style={{
                                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                                borderRadius: 14, padding: 16,
                                borderLeftWidth: 3, borderLeftColor: '#F59E0B',
                            }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, fontFamily: 'TTFirsNeue', marginBottom: 6 }}>
                                    {item.title}
                                </Text>
                                <Text style={{ fontSize: 13, color: mutedText, fontFamily: 'TTFirsNeue', lineHeight: 19, marginBottom: 8 }}>
                                    {item.description}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Ionicons name="calendar-outline" size={12} color={mutedText} />
                                    <Text style={{ fontSize: 11, color: mutedText, fontFamily: 'TTFirsNeue' }}>
                                        Completed {new Date(item.completedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <EmptyState icon="images-outline" text="No portfolio items added yet" mutedText={mutedText} />
                )}
            </Section>
        )
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    if (activeTab === 'reviews') {
        return (
            <View style={{ paddingBottom: 8 }}>
                <RatingDisplay
                    professionalId={data.profile?.user?.id?.toString() ?? ''}
                    professionalName={`${data.profile?.firstName ?? ''} ${data.profile?.lastName ?? ''}`.trim() || 'Professional'}
                    showAddRating={false}
                />
            </View>
        )
    }

    return null
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const Section = ({
    title, children, isDark, textPrimary
}: {
    title: string
    children: React.ReactNode
    isDark: boolean
    textPrimary: string
}) => (
    <View style={{ marginBottom: 24 }}>
        <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: textPrimary,
            fontFamily: 'TTFirsNeue',
            marginBottom: 14,
            letterSpacing: 0.2,
        }}>
            {title}
        </Text>
        {children}
    </View>
)

const DetailRow = ({
    icon, label, primaryColor, mutedText, faType
}: {
    icon: string
    label: string
    primaryColor: string
    mutedText: string
    faType?: 'ionicon'
}) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: primaryColor + '15', justifyContent: 'center', alignItems: 'center' }}>
            {faType === 'ionicon'
                ? <Ionicons name={icon as any} size={15} color={primaryColor} />
                : <FontAwesome5 name={icon} size={13} color={primaryColor} />
            }
        </View>
        <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', flex: 1 }}>
            {label}
        </Text>
    </View>
)

const EmptyState = ({
    icon, text, mutedText
}: {
    icon: string
    text: string
    mutedText: string
}) => (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Ionicons name={icon as any} size={44} color={mutedText} />
        <Text style={{ fontSize: 14, color: mutedText, fontFamily: 'TTFirsNeue', marginTop: 12, textAlign: 'center' }}>
            {text}
        </Text>
    </View>
)

export default ProfessionalProfile
