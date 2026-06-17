import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import {
    View, ScrollView, Text, StatusBar, TouchableOpacity,
    ActivityIndicator, Image, FlatList
} from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { useSecureAuth } from "hooks/useSecureAuth"
import {
    getSectorsFn, getProfessionsBySectorFn, setupProfessionalFn,
    getAvailableRolesFn, Sector, Profession
} from "services/roleSwitchService"

const ProfessionalSetupScreen = () => {
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor, backgroundColor, primaryTextColor } = getColors(theme)
    const dispatch = useDispatch<any>()
    const { saveAuthData } = useSecureAuth()

    const token = useSelector((state: RootState) => state.auth.token) || ''

    // null = still checking, true = already registered, false = needs setup
    const [alreadyRegistered, setAlreadyRegistered] = useState<boolean | null>(null)
    const [existingProfession, setExistingProfession] = useState<string | null>(null)

    const [step, setStep] = useState<1 | 2>(1)
    const [sectors, setSectors] = useState<Sector[]>([])
    const [professions, setProfessions] = useState<Profession[]>([])
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
    const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null)
    const [loadingSectors, setLoadingSectors] = useState(false)
    const [loadingProfessions, setLoadingProfessions] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        checkExistingRegistration()
    }, [])

    const checkExistingRegistration = async () => {
        try {
            const data = await getAvailableRolesFn(token)
            const professional = data.roles.find(r => r.role === 'professional')
            if (professional?.available) {
                setAlreadyRegistered(true)
                // Try to get profession name from user profile
                const profName = (professional as any).professionTitle || null
                setExistingProfession(profName)
            } else {
                setAlreadyRegistered(false)
                loadSectors()
            }
        } catch {
            setAlreadyRegistered(false)
            loadSectors()
        }
    }

    const loadSectors = async () => {
        try {
            setLoadingSectors(true)
            const data = await getSectorsFn(token)
            setSectors(data)
        } catch {
            setError('Failed to load sectors')
        } finally {
            setLoadingSectors(false)
        }
    }

    const handleSelectSector = async (sector: Sector) => {
        setSelectedSector(sector)
        setSelectedProfession(null)
        setStep(2)
        try {
            setLoadingProfessions(true)
            const data = await getProfessionsBySectorFn(sector.id, token)
            setProfessions(data)
        } catch {
            setError('Failed to load professions')
        } finally {
            setLoadingProfessions(false)
        }
    }

    const handleConfirm = async (professionId?: number) => {
        try {
            setSubmitting(true)
            setError(null)
            const result = await setupProfessionalFn(professionId ?? 0, token)
            if (result.user && result.token) {
                await saveAuthData(result.user, result.token)
                dispatch({ type: 'auth/switchRole/fulfilled', payload: result })
            }
            router.replace('/(Authenticated)/(professionalLayout)' as any)
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Setup failed')
        } finally {
            setSubmitting(false)
        }
    }

    // Checking registration status
    if (alreadyRegistered === null) {
        return (
            <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        )
    }

    // User already has a professional profile — skip setup, just confirm switch
    if (alreadyRegistered) {
        return (
            <View style={{ flex: 1, backgroundColor }} className="h-full w-full px-3">
                <StatusBar barStyle="default" />
                <HeaderComponent title="Switch to Professional" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                    <View style={{ backgroundColor: '#F59E0B20', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <FontAwesome5 name="tools" size={34} color="#F59E0B" />
                    </View>
                    <ThemeText size={Textstyles.text_xmedium}>Professional Profile Found</ThemeText>
                    <EmptyView height={8} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        You already have a professional profile set up.
                        {existingProfession ? ` You're registered as a ${existingProfession}.` : ''}
                        {' '}Tap below to switch your active role.
                    </ThemeTextsecond>
                    <EmptyView height={32} />
                    {error && (
                        <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginBottom: 16, width: '100%' }}>
                            <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => handleConfirm()}
                        disabled={submitting}
                        style={{
                            backgroundColor: primaryColor, borderRadius: 14,
                            paddingVertical: 15, paddingHorizontal: 32,
                            flexDirection: 'row', alignItems: 'center', gap: 8
                        }}
                        activeOpacity={0.8}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="swap-horizontal" size={18} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Switch to Professional</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    // Full setup flow
    return (
        <View style={{ flex: 1, backgroundColor }} className="h-full w-full px-3">
            <StatusBar barStyle="default" />
            <HeaderComponent title="Become a Professional" />
            <EmptyView height={16} />

            {/* Step indicator */}
            <View className="flex-row items-center px-1 mb-4">
                <View style={{ backgroundColor: primaryColor }} className="w-6 h-6 rounded-full justify-center items-center">
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>1</Text>
                </View>
                <View style={{ flex: 1, height: 2, backgroundColor: step === 2 ? primaryColor : '#E5E7EB', marginHorizontal: 6 }} />
                <View style={{ backgroundColor: step === 2 ? primaryColor : '#E5E7EB' }} className="w-6 h-6 rounded-full justify-center items-center">
                    <Text style={{ color: step === 2 ? '#fff' : '#9CA3AF', fontSize: 11, fontWeight: '700' }}>2</Text>
                </View>
            </View>

            {error && (
                <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                </View>
            )}

            {/* Step 1: Sector selection */}
            {step === 1 && (
                <>
                    <ThemeText size={Textstyles.text_xmedium}>Choose a sector</ThemeText>
                    <EmptyView height={4} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Select the industry you work in
                    </ThemeTextsecond>
                    <EmptyView height={16} />

                    {loadingSectors ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color={primaryColor} />
                        </View>
                    ) : (
                        <FlatList
                            data={sectors}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelectSector(item)}
                                    style={{ backgroundColor: selectioncardColor, flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 3 }}
                                    activeOpacity={0.75}
                                >
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 10 }} />
                                    ) : (
                                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: primaryColor + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                            <FontAwesome5 name="briefcase" size={20} color={primaryColor} />
                                        </View>
                                    )}
                                    <Text style={{ color: primaryTextColor, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </>
            )}

            {/* Step 2: Profession selection */}
            {step === 2 && (
                <>
                    <View className="flex-row items-center mb-3">
                        <TouchableOpacity
                            onPress={() => { setStep(1); setSelectedSector(null); setSelectedProfession(null) }}
                            style={{ marginRight: 10 }}
                        >
                            <AntDesign name="arrowleft" size={20} color={primaryColor} />
                        </TouchableOpacity>
                        <View>
                            <ThemeText size={Textstyles.text_xmedium}>Choose your profession</ThemeText>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>{selectedSector?.title}</ThemeTextsecond>
                        </View>
                    </View>

                    {loadingProfessions ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color={primaryColor} />
                        </View>
                    ) : (
                        <>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                                <View style={{ backgroundColor: selectioncardColor, borderRadius: 16, elevation: 3 }}>
                                    {professions.map((profession, index) => {
                                        const selected = selectedProfession?.id === profession.id
                                        return (
                                            <TouchableOpacity
                                                key={profession.id}
                                                onPress={() => setSelectedProfession(profession)}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center',
                                                    paddingHorizontal: 16, paddingVertical: 14,
                                                    borderBottomWidth: index < professions.length - 1 ? 1 : 0,
                                                    borderBottomColor: '#E5E7EB',
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View style={{
                                                    width: 22, height: 22, borderRadius: 11,
                                                    borderWidth: 2, borderColor: selected ? primaryColor : '#D1D5DB',
                                                    backgroundColor: selected ? primaryColor : 'transparent',
                                                    justifyContent: 'center', alignItems: 'center', marginRight: 12
                                                }}>
                                                    {selected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                                                </View>
                                                <Text style={{ color: primaryTextColor, fontSize: 14, flex: 1 }}>{profession.title}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                    {professions.length === 0 && (
                                        <View style={{ padding: 24, alignItems: 'center' }}>
                                            <ThemeTextsecond size={Textstyles.text_xsmall}>No professions found in this sector</ThemeTextsecond>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={{ position: 'absolute', bottom: 24, left: 12, right: 12 }}>
                                <TouchableOpacity
                                    onPress={() => handleConfirm(selectedProfession?.id)}
                                    disabled={!selectedProfession || submitting}
                                    style={{
                                        backgroundColor: selectedProfession ? primaryColor : '#D1D5DB',
                                        borderRadius: 14, paddingVertical: 15,
                                        alignItems: 'center', justifyContent: 'center',
                                        flexDirection: 'row', gap: 8
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                                Confirm &amp; Switch Role
                                            </Text>
                                            <AntDesign name="arrowright" size={16} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </>
            )}
        </View>
    )
}

export default ProfessionalSetupScreen
