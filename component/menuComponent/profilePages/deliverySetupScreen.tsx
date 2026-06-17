import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import {
    View, ScrollView, Text, StatusBar, TouchableOpacity,
    ActivityIndicator, TextInput, KeyboardAvoidingView, Platform
} from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { useSecureAuth } from "hooks/useSecureAuth"
import { setupDeliveryFn, getAvailableRolesFn } from "services/roleSwitchService"

type VehicleType = 'bike' | 'car' | 'bus' | 'truck' | 'keke'

const VEHICLES: { type: VehicleType; label: string; icon: string; iconSet: 'fa5' | 'mci' }[] = [
    { type: 'bike', label: 'Motorcycle', icon: 'motorcycle', iconSet: 'fa5' },
    { type: 'car', label: 'Car', icon: 'car', iconSet: 'fa5' },
    { type: 'keke', label: 'Tricycle (Keke)', icon: 'rickshaw', iconSet: 'mci' },
    { type: 'bus', label: 'Bus / Van', icon: 'bus', iconSet: 'fa5' },
    { type: 'truck', label: 'Truck', icon: 'truck', iconSet: 'fa5' },
]

const VehicleIcon = ({ icon, iconSet, size, color }: { icon: string; iconSet: 'fa5' | 'mci'; size: number; color: string }) => {
    if (iconSet === 'mci') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />
    return <FontAwesome5 name={icon} size={size} color={color} />
}

const DeliverySetupScreen = () => {
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor, backgroundColor, primaryTextColor } = getColors(theme)
    const dispatch = useDispatch<any>()
    const { saveAuthData } = useSecureAuth()

    const token = useSelector((state: RootState) => state.auth.token) || ''

    // null = still checking, true = already registered, false = needs setup
    const [alreadyRegistered, setAlreadyRegistered] = useState<boolean | null>(null)

    const [step, setStep] = useState<1 | 2>(1)
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
    const [licenseNumber, setLicenseNumber] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        checkExistingRegistration()
    }, [])

    const checkExistingRegistration = async () => {
        try {
            const data = await getAvailableRolesFn(token)
            const delivery = data.roles.find(r => r.role === 'delivery')
            setAlreadyRegistered(!!delivery?.available)
        } catch {
            setAlreadyRegistered(false)
        }
    }

    const handleConfirm = async () => {
        try {
            setSubmitting(true)
            setError(null)
            // If already registered, vehicleType/licenseNumber are ignored by backend
            const result = await setupDeliveryFn(selectedVehicle ?? '', licenseNumber.trim(), token)
            if (result.user && result.token) {
                await saveAuthData(result.user, result.token)
                dispatch({ type: 'auth/switchRole/fulfilled', payload: result })
            }
            router.replace('/(Authenticated)/(delivery)' as any)
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

    // User already has a rider profile — skip setup, just confirm switch
    if (alreadyRegistered) {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{ flex: 1, backgroundColor }} className="h-full w-full px-3">
                    <StatusBar barStyle="default" />
                    <HeaderComponent title="Switch to Delivery" />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                        <View style={{ backgroundColor: '#25D36620', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            <FontAwesome5 name="motorcycle" size={34} color="#25D366" />
                        </View>
                        <ThemeText size={Textstyles.text_xmedium}>Delivery Profile Found</ThemeText>
                        <EmptyView height={8} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            You already have a delivery partner profile set up.
                            {' '}Tap below to switch your active role.
                        </ThemeTextsecond>
                        <EmptyView height={32} />
                        {error && (
                            <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginBottom: 16, width: '100%' }}>
                                <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={submitting}
                            style={{
                                backgroundColor: '#25D366', borderRadius: 14,
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
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Switch to Delivery</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }

    // Full setup flow
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flex: 1, backgroundColor }} className="h-full w-full px-3">
                <StatusBar barStyle="default" />
                <HeaderComponent title="Become a Delivery Partner" />
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

                {/* Step 1: Vehicle type */}
                {step === 1 && (
                    <>
                        <ThemeText size={Textstyles.text_xmedium}>Select your vehicle type</ThemeText>
                        <EmptyView height={4} />
                        <ThemeTextsecond size={Textstyles.text_xsmall}>
                            Choose the vehicle you'll use for deliveries
                        </ThemeTextsecond>
                        <EmptyView height={20} />

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
                            {VEHICLES.map((v) => {
                                const selected = selectedVehicle === v.type
                                return (
                                    <TouchableOpacity
                                        key={v.type}
                                        onPress={() => setSelectedVehicle(v.type)}
                                        style={{
                                            backgroundColor: selectioncardColor,
                                            borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
                                            flexDirection: 'row', alignItems: 'center', elevation: 3,
                                            borderWidth: 2,
                                            borderColor: selected ? primaryColor : 'transparent',
                                        }}
                                        activeOpacity={0.75}
                                    >
                                        <View style={{
                                            width: 48, height: 48, borderRadius: 24,
                                            backgroundColor: selected ? primaryColor : primaryColor + '20',
                                            justifyContent: 'center', alignItems: 'center', marginRight: 16
                                        }}>
                                            <VehicleIcon icon={v.icon} iconSet={v.iconSet} size={22} color={selected ? '#fff' : primaryColor} />
                                        </View>
                                        <Text style={{ color: primaryTextColor, fontSize: 15, fontWeight: '600', flex: 1 }}>{v.label}</Text>
                                        {selected && <AntDesign name="checkcircle" size={20} color={primaryColor} />}
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>

                        <View style={{ paddingBottom: 24 }}>
                            <TouchableOpacity
                                onPress={() => setStep(2)}
                                disabled={!selectedVehicle}
                                style={{
                                    backgroundColor: selectedVehicle ? primaryColor : '#D1D5DB',
                                    borderRadius: 14, paddingVertical: 15,
                                    alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'row', gap: 8
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Continue</Text>
                                <AntDesign name="arrowright" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Step 2: License number */}
                {step === 2 && (
                    <>
                        <View className="flex-row items-center mb-4">
                            <TouchableOpacity onPress={() => setStep(1)} style={{ marginRight: 10 }}>
                                <AntDesign name="arrowleft" size={20} color={primaryColor} />
                            </TouchableOpacity>
                            <View>
                                <ThemeText size={Textstyles.text_xmedium}>Enter your license number</ThemeText>
                                <ThemeTextsecond size={Textstyles.text_xsmall}>
                                    {VEHICLES.find(v => v.type === selectedVehicle)?.label}
                                </ThemeTextsecond>
                            </View>
                        </View>

                        <View style={{ backgroundColor: selectioncardColor, borderRadius: 16, padding: 20, elevation: 3 }}>
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Driver's License / Vehicle License Number</ThemeTextsecond>
                            <EmptyView height={8} />
                            <TextInput
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                                placeholder="e.g. LAG-2024-ABC123"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: licenseNumber ? primaryColor : '#E5E7EB',
                                    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
                                    fontSize: 15, color: primaryTextColor,
                                    backgroundColor: backgroundColor,
                                }}
                            />
                            <EmptyView height={8} />
                            <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                                This will be verified before you start receiving delivery jobs
                            </ThemeTextsecond>
                        </View>

                        <View style={{ position: 'absolute', bottom: 24, left: 12, right: 12 }}>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={!licenseNumber.trim() || submitting}
                                style={{
                                    backgroundColor: licenseNumber.trim() ? primaryColor : '#D1D5DB',
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
            </View>
        </KeyboardAvoidingView>
    )
}

export default DeliverySetupScreen
