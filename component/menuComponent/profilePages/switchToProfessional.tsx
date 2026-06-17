import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { View, ScrollView, Text, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { FontAwesome5, AntDesign, Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "redux/store"
import { router } from "expo-router"
import { getAvailableRolesFn, RoleOption } from "services/roleSwitchService"
import { switchRoleAsync } from "redux/slices/authSlice"

const ROLE_CONFIG: Record<string, { icon: string; desc: string; setupRoute: string }> = {
    client: {
        icon: 'user',
        desc: 'Browse and hire professionals, buy products',
        setupRoute: '',
    },
    professional: {
        icon: 'tools',
        desc: 'Offer services like plumbing, electrical, carpentry, etc.',
        setupRoute: '/(Authenticated)/(profile)/professionalsetuplayout',
    },
    delivery: {
        icon: 'motorcycle',
        desc: 'Deliver packages and earn on your own schedule',
        setupRoute: '/(Authenticated)/(profile)/deliverysetuplayout',
    },
}

const getRoleDashboardRoute = (role: string): string => {
    switch (role) {
        case 'professional': return '/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout'
        case 'delivery': return '/(Authenticated)/(delivery)/deliverydashboardlayout'
        default: return '/(Authenticated)/(dashboard)/homelayout'
    }
}

const SwitchToProfessional = () => {
    const { theme } = useTheme()
    const { primaryColor, selectioncardColor, backgroundColor, successColor, warningColor, secondaryTextColor } = getColors(theme)
    const dispatch = useDispatch<any>()

    const user = useSelector((state: RootState) => state.auth.user)
    const token = useSelector((state: RootState) => state.auth.token) || ''
    const currentRole = user?.role

    const [roles, setRoles] = useState<RoleOption[]>([])
    const [fetching, setFetching] = useState(false)
    const [switchingTo, setSwitchingTo] = useState<string | null>(null)

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'client': return primaryColor
            case 'professional': return warningColor
            case 'delivery': return successColor
            default: return primaryColor
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setFetching(true)
            const data = await getAvailableRolesFn(token)
            setRoles(data.roles)
        } catch (err: any) {
            console.error('Failed to load available roles:', err)
        } finally {
            setFetching(false)
        }
    }

    const handleSwitch = (role: RoleOption) => {
        Alert.alert(
            `Switch to ${role.label}`,
            `Switch your active role to ${role.label}? Your app experience will change.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Switch', onPress: () => performSwitch(role.role) },
            ]
        )
    }

    const performSwitch = async (targetRole: string) => {
        setSwitchingTo(targetRole)
        try {
            // Thunk now passes the token, calls the API, updates Redux, and persists to SecureStore
            await dispatch(switchRoleAsync(targetRole)).unwrap()
            // Replace the entire nav stack so back-button can't return to the old dashboard
            router.replace(getRoleDashboardRoute(targetRole) as any)
        } catch (err: any) {
            Alert.alert('Error', typeof err === 'string' ? err : 'Failed to switch role')
        } finally {
            setSwitchingTo(null)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor }} className="h-full w-full px-3">
            <StatusBar barStyle="default" />
            <HeaderComponent title="Switch Role" />
            <EmptyView height={20} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Hero */}
                <View className="items-center">
                    <View style={{ backgroundColor: primaryColor }} className="w-20 h-20 rounded-full justify-center items-center">
                        <Ionicons name="swap-horizontal" color="#ffffff" size={36} />
                    </View>
                    <EmptyView height={10} />
                    <ThemeText size={Textstyles.text_medium}>Switch Role</ThemeText>
                    <EmptyView height={5} />
                    <ThemeTextsecond size={Textstyles.text_xsmall}>
                        Switch between your registered roles or sign up for new ones
                    </ThemeTextsecond>
                </View>

                <EmptyView height={30} />

                {/* Current Role */}
                {currentRole && (
                    <View>
                        <ThemeTextsecond size={Textstyles.text_cmedium}>Current Role</ThemeTextsecond>
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-4 mb-4">
                            <View className="flex-row items-center gap-x-3">
                                <View style={{ backgroundColor: getRoleColor(currentRole) }}
                                    className="w-10 h-10 rounded-full justify-center items-center">
                                    <FontAwesome5
                                        name={ROLE_CONFIG[currentRole]?.icon || 'user'}
                                        color="#ffffff"
                                        size={18}
                                    />
                                </View>
                                <View className="flex-1">
                                    <ThemeText size={Textstyles.text_xmedium}>
                                        {roles.find(r => r.role === currentRole)?.label || currentRole}
                                    </ThemeText>
                                    <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                                        {ROLE_CONFIG[currentRole]?.desc || 'Active role'}
                                    </ThemeTextsecond>
                                </View>
                                <View style={{ backgroundColor: successColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                    <Text style={{ color: successColor, fontSize: 11, fontWeight: '600' }}>Active</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Available Roles */}
                <View>
                    <ThemeTextsecond size={Textstyles.text_cmedium}>Available Roles</ThemeTextsecond>

                    {fetching ? (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color={primaryColor} />
                            <EmptyView height={10} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Loading roles...</ThemeTextsecond>
                        </View>
                    ) : (
                        <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 pb-2">
                            {roles
                                .filter(r => r.role !== currentRole && r.role !== 'corperate')
                                .map((role, index, arr) => {
                                    const config = ROLE_CONFIG[role.role]
                                    const isSwitching = switchingTo === role.role
                                    return (
                                        <View
                                            key={role.role}
                                            className={`flex-row justify-between items-center py-5 ${
                                                index < arr.length - 1 ? 'border-b border-slate-300' : ''
                                            }`}
                                        >
                                            <View className="flex-row gap-x-3 items-center flex-1">
                                                <View style={{ backgroundColor: getRoleColor(role.role) }}
                                                    className="w-12 h-12 rounded-full justify-center items-center">
                                                    <FontAwesome5 name={config?.icon || 'user'} color="#ffffff" size={20} />
                                                </View>
                                                <View className="flex-1">
                                                    <ThemeText size={Textstyles.text_xmedium}>{role.label}</ThemeText>
                                                    <ThemeTextsecond size={Textstyles.text_xxxsmall}>
                                                        {config?.desc || ''}
                                                    </ThemeTextsecond>
                                                    {!role.available && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                                                            <AntDesign name="infocirlceo" size={11} color={warningColor} />
                                                            <Text style={{ color: warningColor, fontSize: 10, fontWeight: '500' }}>
                                                                Registration required
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {isSwitching ? (
                                                <ActivityIndicator size="small" color={primaryColor} />
                                            ) : role.available ? (
                                                <TouchableOpacity
                                                    onPress={() => handleSwitch(role)}
                                                    disabled={!!switchingTo}
                                                >
                                                    <View style={{ backgroundColor: primaryColor, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
                                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Switch</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    disabled={!!switchingTo}
                                                    onPress={() => {
                                                        if (config?.setupRoute) router.push(config.setupRoute as any)
                                                    }}
                                                >
                                                    <View style={{ backgroundColor: warningColor + '20', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 }}>
                                                        <Text style={{ color: warningColor, fontSize: 12, fontWeight: '600' }}>Set up</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )
                                })}
                        </View>
                    )}
                </View>

                <EmptyView height={20} />

                {/* How It Works */}
                <View>
                    <ThemeTextsecond size={Textstyles.text_cmedium}>How It Works</ThemeTextsecond>
                    <View style={{ backgroundColor: selectioncardColor, elevation: 4 }}
                        className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-5">
                        <View className="flex-row items-center gap-x-3 py-2">
                            <AntDesign name="swap" color={primaryColor} size={18} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Switch between roles anytime</ThemeTextsecond>
                        </View>
                        <View className="flex-row items-center gap-x-3 py-2">
                            <AntDesign name="wallet" color={primaryColor} size={18} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Your wallet balance is shared across all roles</ThemeTextsecond>
                        </View>
                        <View className="flex-row items-center gap-x-3 py-2">
                            <AntDesign name="message1" color={primaryColor} size={18} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Your chat history is preserved when switching</ThemeTextsecond>
                        </View>
                        <View className="flex-row items-center gap-x-3 py-2">
                            <AntDesign name="lock" color={primaryColor} size={18} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>Each role has its own dashboard and features</ThemeTextsecond>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}
export default SwitchToProfessional
