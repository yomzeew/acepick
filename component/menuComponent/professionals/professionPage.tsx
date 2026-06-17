import React from "react"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import EmptyView from "component/emptyview"
import { useLocalSearchParams, router } from "expo-router"
import {
    TouchableOpacity,
    Text,
    View,
    Image,
    Animated,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    TextInput
} from "react-native"
import {
    AntDesign,
    FontAwesome5,
    FontAwesome6,
    Ionicons
} from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { useEffect, useRef, useState } from "react"
import RatingStar from "component/rating"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useMutation } from "@tanstack/react-query"
import { getArtisanListFn } from "services/userService"
import { AlertMessageBanner } from "component/AlertMessageBanner"
import SliderModalTemplate from "component/slideupModalTemplate"
import ProfessionalFilter from "component/professionalFilter"

const Professional = () => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [artisanData, setArtisanData] = useState<any[]>([])
    const [filterData, setFilterData] = useState<any[]>([])
    const [showFilter, setShowFilter] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollY = useRef(new Animated.Value(0)).current

    const token: string = useSelector((state: RootState) => state.auth?.token ?? "")
    const { id, profession } = useLocalSearchParams()

    const professionName = profession ? decodeURIComponent(profession.toString()) : "Professionals"
    const professionalId = Number(id)

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [errorMessage])

    const mutation = useMutation({
        mutationFn: (query: string) => getArtisanListFn(token, query),
        onSuccess: (response: any) => {
            setArtisanData(response.data || [])
            setRefreshing(false)
        },
        onError: (error: any) => {
            setRefreshing(false)
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "An unexpected error occurred"
            setErrorMessage(msg)
        },
    })

    useEffect(() => {
        mutation.mutate(`professionId=${professionalId}`)
    }, [professionalId])

    useEffect(() => {
        if (filterData.length > 0) setArtisanData(filterData)
    }, [filterData])

    const onRefresh = () => {
        setRefreshing(true)
        mutation.mutate(`professionId=${professionalId}`)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = setTimeout(() => {
            const parts: string[] = []
            if (professionalId) parts.push(`professionId=${professionalId}`)
            if (query) parts.push(`profession=${encodeURIComponent(query)}`)
            mutation.mutate(parts.join('&'))
        }, 500)
    }

    const availableCount = artisanData.filter((item: any) => item.available).length

    return (
        <>
            {errorMessage ? <AlertMessageBanner type="error" message={errorMessage} /> : null}

            <SliderModalTemplate showmodal={showFilter} setshowmodal={setShowFilter} modalHeight={'70%'}>
                <ProfessionalFilter
                    showmodal={showFilter}
                    setshowmodal={setShowFilter}
                    setfilterData={setFilterData}
                    professionId={professionalId}
                />
            </SliderModalTemplate>

            <ContainerTemplate>
                <Animated.View
                    style={{
                        transform: [{
                            translateY: scrollY.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, -20],
                                extrapolate: 'clamp'
                            })
                        }]
                    }}
                >
                    <HeaderComponent title={professionName} />
                </Animated.View>

                <EmptyView height={12} />

                {/* Search + Filter Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14, gap: 10 }}>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: selectioncardColor,
                            borderRadius: 14,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                        }}
                    >
                        <Ionicons name="search" size={18} color={secondaryTextColor} />
                        <TextInput
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue',
                                fontSize: 14,
                            }}
                            placeholder="Search by name..."
                            placeholderTextColor={secondaryTextColor + '80'}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 ? (
                            <TouchableOpacity onPress={() => handleSearch("")}>
                                <Ionicons name="close-circle" size={18} color={secondaryTextColor} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Filter Button */}
                    <TouchableOpacity
                        onPress={() => setShowFilter(true)}
                        style={{
                            backgroundColor: primaryColor,
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            elevation: 3,
                            shadowColor: primaryColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                        }}
                        activeOpacity={0.8}
                    >
                        <AntDesign size={18} color="#ffffff" name="filter" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                {!mutation.isPending && artisanData.length > 0 ? (
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14, gap: 10 }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: primaryColor + '12',
                                borderRadius: 12,
                                padding: 12,
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 17,
                                    backgroundColor: primaryColor + '20',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <FontAwesome5 name="users" size={13} color={primaryColor} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: primaryColor, fontFamily: 'TTFirsNeue', lineHeight: 22 }}>
                                    {String(artisanData.length)}
                                </Text>
                                <Text style={{ fontSize: 11, color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.8 }}>
                                    {'Total'}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#22C55E12',
                                borderRadius: 12,
                                padding: 12,
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 17,
                                    backgroundColor: '#22C55E20',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <FontAwesome5 name="check-circle" size={13} color="#22C55E" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#22C55E', fontFamily: 'TTFirsNeue', lineHeight: 22 }}>
                                    {String(availableCount)}
                                </Text>
                                <Text style={{ fontSize: 11, color: secondaryTextColor, fontFamily: 'TTFirsNeue', opacity: 0.8 }}>
                                    {'Available'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* List */}
                <View style={{ flex: 1 }}>
                    <ArtisanPage
                        artisanData={artisanData}
                        isLoading={mutation.isPending}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                </View>
            </ContainerTemplate>
        </>
    )
}

export default Professional

// ─── ArtisanPage ────────────────────────────────────────────────────────────

interface ArtisanPageProps {
    artisanData: any[]
    isLoading?: boolean
    refreshing?: boolean
    onRefresh?: () => void
}

export const ArtisanPage = ({ artisanData, isLoading = false, refreshing = false, onRefresh }: ArtisanPageProps) => {
    const { theme } = useTheme()
    const { secondaryTextColor, primaryColor, selectioncardColor } = getColors(theme)

    const handlePress = (id: number) => {
        router.push({
            pathname: '/(Authenticated)/(professionalLayout)/(professionalprofile)/[professionalId]',
            params: { professionalId: String(id) }
        } as any)
    }

    if (isLoading && artisanData.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ marginTop: 12, color: secondaryTextColor, fontFamily: 'TTFirsNeue', fontSize: 14 }}>
                    {'Loading professionals...'}
                </Text>
            </View>
        )
    }

    return (
        <FlatList
            data={artisanData}
            keyExtractor={(item: any, index: number) => item.id?.toString() ?? index.toString()}
            renderItem={({ item }: { item: any }) => (
                <TouchableOpacity 
                    onPress={() => handlePress(item.id)} 
                    activeOpacity={0.85}
                    style={{ marginBottom: 10 }}
                >
                    <ListCard
                        title={item.profession?.title ?? 'Professional'}
                        firstName={item.profile?.firstName ?? ''}
                        lastName={item.profile?.lastName ?? ''}
                        state={item.profile?.user?.location?.state ?? ''}
                        lga={item.profile?.user?.location?.lga ?? ''}
                        avatar={item.profile?.avatar ?? ''}
                        charges={item.chargeFrom}
                        available={item.available}
                        avgRating={item.avgRating}
                        verified={item.profile?.verified}
                    />
                </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                !isLoading ? (
                    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                        <View
                            style={{
                                backgroundColor: selectioncardColor,
                                borderRadius: 20,
                                padding: 32,
                                alignItems: 'center',
                                width: '90%',
                            }}
                        >
                            <Ionicons name="people-outline" size={52} color={secondaryTextColor + '60'} />
                            <Text style={{ marginTop: 16, fontSize: 15, color: secondaryTextColor, fontFamily: 'TTFirsNeue', textAlign: 'center', lineHeight: 22 }}>
                                {'No professionals found\nfor this category'}
                            </Text>
                            {onRefresh ? (
                                <TouchableOpacity
                                    onPress={onRefresh}
                                    style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: primaryColor + '15', borderRadius: 10 }}
                                >
                                    <Text style={{ color: primaryColor, fontFamily: 'TTFirsNeue', fontWeight: '600' }}>
                                        {'Refresh'}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>
                ) : null
            }
            getItemLayout={(_: any, index: number) => ({ length: 110, offset: 110 * index, index })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            windowSize={10}
        />
    )
}

// ─── ListCard ────────────────────────────────────────────────────────────────

interface ListCardProps {
    firstName: string
    lastName: string
    state: string
    lga: string
    charges: string
    title: string
    available: boolean
    avatar: string
    avgRating?: number
    verified?: boolean
}

const getAvatarSource = (avatar: string) => {
    if (!avatar || avatar.trim() === '') return require('../../../assets/professional.png')
    if (avatar.includes('placehold.co') || avatar.includes('text=Avatar')) return require('../../../assets/professional.png')
    if (avatar.startsWith('http') || avatar.startsWith('/')) return { uri: avatar }
    return require('../../../assets/professional.png')
}

const ListCard = React.memo(function ListCardComponent({
    firstName, lastName, state, lga, charges, title, available, avatar, avgRating, verified
}: ListCardProps) {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme)

    const scaleAnim = useRef(new Animated.Value(1)).current
    const opacityAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(16)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start()
    }, [])

    const pressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, tension: 120, friction: 8 }).start()

    const pressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 5 }).start()

    const chargeText = charges != null && charges !== ''
        ? `From ₦${charges}`
        : 'Contact for pricing'

    const hasRating = avgRating != null && avgRating > 0
    const AVAILABLE_COLOR = '#22C55E'
    const BUSY_COLOR = '#F59E0B'
    const statusColor = available ? AVAILABLE_COLOR : BUSY_COLOR

    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                marginBottom: 10,
            }}
        >
            <View
                style={{
                    backgroundColor: selectioncardColor,
                    borderRadius: 16,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.07,
                    shadowRadius: 6,
                    borderWidth: 1,
                    borderColor: theme === 'dark' ? '#2D3748' : '#F0F0F0',
                }}
            >
                    {/* Top accent bar */}
                    <View style={{ height: 3, backgroundColor: statusColor, opacity: 0.7 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
                        {/* Avatar */}
                        <View style={{ position: 'relative' }}>
                            <Image
                                source={getAvatarSource(avatar)}
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 26,
                                    borderWidth: 2,
                                    borderColor: statusColor + '30',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
                                }}
                                resizeMode="cover"
                            />
                            {/* Online dot */}
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 1,
                                    right: 1,
                                    width: 13,
                                    height: 13,
                                    borderRadius: 7,
                                    backgroundColor: statusColor,
                                    borderWidth: 2,
                                    borderColor: selectioncardColor,
                                }}
                            />
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            {/* Name + verified */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '700',
                                        color: theme === 'dark' ? '#F9FAFB' : '#111827',
                                        fontFamily: 'TTFirsNeue',
                                        flexShrink: 1,
                                    }}
                                    numberOfLines={1}
                                >
                                    {`${firstName} ${lastName}`.trim() || 'Professional'}
                                </Text>
                                {verified ? (
                                    <FontAwesome5 name="check-circle" size={11} color={primaryColor} style={{ marginLeft: 4 }} />
                                ) : null}
                            </View>

                            {/* Profession title */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                <FontAwesome5 name="toolbox" size={9} color={primaryColor} />
                                <Text
                                    style={{ fontSize: 11, color: secondaryTextColor, fontFamily: 'TTFirsNeue', marginLeft: 5 }}
                                    numberOfLines={1}
                                >
                                    {title}
                                </Text>
                            </View>

                            {/* Location */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                <FontAwesome6 name="location-dot" size={9} color={primaryColor} />
                                <Text
                                    style={{ fontSize: 10, color: secondaryTextColor, fontFamily: 'TTFirsNeue', marginLeft: 4 }}
                                    numberOfLines={1}
                                >
                                    {[lga, state].filter(Boolean).join(' • ')}
                                </Text>
                            </View>

                            {/* Price + Rating */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: primaryColor, fontFamily: 'TTFirsNeue' }}>
                                    {chargeText}
                                </Text>
                                {hasRating ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                        <RatingStar numberOfStars={Math.round(avgRating!)} />
                                        <Text style={{ fontSize: 10, color: secondaryTextColor, fontFamily: 'TTFirsNeue' }}>
                                            {avgRating!.toFixed(1)}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* Status badge */}
                        <View
                            style={{
                                marginLeft: 10,
                                backgroundColor: statusColor + '18',
                                borderRadius: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderWidth: 1,
                                borderColor: statusColor + '40',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor, fontFamily: 'TTFirsNeue' }}>
                                {available ? 'Available' : 'Busy'}
                            </Text>
                        </View>
                    </View>
                </View>
        </Animated.View>
    )
})
