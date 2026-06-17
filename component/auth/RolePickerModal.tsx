/**
 * RolePickerModal
 * Shown after login when a user has multiple roles set up.
 * Lets them choose which dashboard to enter.
 */
import React, { useState } from "react"
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Pressable,
} from "react-native"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { RoleOption, switchRoleFn } from "services/roleSwitchService"
import { useDispatch } from "react-redux"
import { setUser, setToken } from "redux/slices/authSlice"
import { useSecureAuth } from "hooks/useSecureAuth"
import { router } from "expo-router"

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, {
    icon: string
    iconLib: 'ionicon' | 'fa5'
    desc: string
    route: string
}> = {
    client: {
        icon: 'person',
        iconLib: 'ionicon',
        desc: 'Browse & hire professionals, buy products',
        route: '/(Authenticated)/(dashboard)/homelayout',
    },
    professional: {
        icon: 'tools',
        iconLib: 'fa5',
        desc: 'Offer your services and manage jobs',
        route: '/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout',
    },
    delivery: {
        icon: 'bicycle',
        iconLib: 'ionicon',
        desc: 'Deliver packages and earn on your schedule',
        route: '/(Authenticated)/(delivery)/deliverydashboardlayout',
    },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean
    roles: RoleOption[]          // available roles from getAvailableRolesFn
    currentRole: string          // role the user logged in with
    pendingUser: any             // user object from login response
    pendingToken: string         // token from login response
    onClose: () => void          // called if user dismisses without picking
}

// ─── Component ────────────────────────────────────────────────────────────────

const RolePickerModal = ({
    visible, roles, currentRole, pendingUser, pendingToken, onClose
}: Props) => {
    const { theme } = useTheme()
    const { primaryColor } = getColors(theme)
    const dispatch = useDispatch()
    const { saveAuthData } = useSecureAuth()

    const isDark = theme === 'dark'
    const bgModal  = isDark ? '#1F2937' : '#FFFFFF'
    const bgOverlay = 'rgba(0,0,0,0.55)'
    const textPrimary = isDark ? '#F9FAFB' : '#111827'
    const textMuted   = isDark ? '#9CA3AF' : '#6B7280'
    const divider     = isDark ? '#374151' : '#E5E7EB'

    const [switching, setSwitching] = useState<string | null>(null)

    const handlePick = async (role: RoleOption) => {
        setSwitching(role.role)
        try {
            let finalUser  = pendingUser
            let finalToken = pendingToken

            if (role.role !== currentRole) {
                // Need to switch — get a new token for the chosen role
                const switched = await switchRoleFn(role.role, pendingToken)
                finalUser  = switched.user
                finalToken = switched.token
            }

            // Persist + update Redux
            await saveAuthData(finalUser, finalToken)
            dispatch(setUser(finalUser))
            dispatch(setToken(finalToken))

            const cfg = ROLE_CONFIG[role.role]
            router.replace(cfg?.route as any ?? '/(Authenticated)/(dashboard)/homelayout')
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to enter dashboard')
        } finally {
            setSwitching(null)
        }
    }

    const availableRoles = roles.filter(r => r.available && r.role !== 'corperate')

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                style={{ flex: 1, backgroundColor: bgOverlay, justifyContent: 'flex-end' }}
                onPress={onClose}
            >
                {/* Sheet — stop propagation so tapping inside doesn't close */}
                <Pressable onPress={() => {}}>
                    <View style={{
                        backgroundColor: bgModal,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        paddingHorizontal: 24,
                        paddingTop: 12,
                        paddingBottom: 40,
                    }}>
                        {/* Handle bar */}
                        <View style={{
                            width: 40, height: 4, borderRadius: 2,
                            backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
                            alignSelf: 'center', marginBottom: 20,
                        }} />

                        {/* Title */}
                        <Text style={{
                            fontSize: 20, fontWeight: '700', color: textPrimary,
                            fontFamily: 'TTFirsNeue', marginBottom: 6,
                        }}>
                            Choose Dashboard
                        </Text>
                        <Text style={{
                            fontSize: 13, color: textMuted,
                            fontFamily: 'TTFirsNeue', marginBottom: 24, lineHeight: 19,
                        }}>
                            You have multiple roles. Select which dashboard you'd like to enter.
                        </Text>

                        {/* Role cards */}
                        <View style={{ gap: 12 }}>
                            {availableRoles.map((role) => {
                                const cfg = ROLE_CONFIG[role.role]
                                if (!cfg) return null
                                const isActive   = role.role === currentRole
                                const isLoading  = switching === role.role
                                const isDisabled = !!switching

                                return (
                                    <TouchableOpacity
                                        key={role.role}
                                        onPress={() => handlePick(role)}
                                        disabled={isDisabled}
                                        activeOpacity={0.75}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 14,
                                            padding: 16,
                                            borderRadius: 18,
                                            backgroundColor: isActive
                                                ? primaryColor + '12'
                                                : isDark ? '#111827' : '#F9FAFB',
                                            borderWidth: isActive ? 2 : 1,
                                            borderColor: isActive ? primaryColor : divider,
                                            opacity: isDisabled && !isLoading ? 0.5 : 1,
                                        }}
                                    >
                                        {/* Icon bubble */}
                                        <View style={{
                                            width: 50, height: 50, borderRadius: 16,
                                            backgroundColor: primaryColor + '20',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            {cfg.iconLib === 'fa5'
                                                ? <FontAwesome5 name={cfg.icon} size={22} color={primaryColor} />
                                                : <Ionicons name={cfg.icon as any} size={24} color={primaryColor} />
                                            }
                                        </View>

                                        {/* Text */}
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={{
                                                    fontSize: 15, fontWeight: '700',
                                                    color: textPrimary, fontFamily: 'TTFirsNeue',
                                                }}>
                                                    {role.label}
                                                </Text>
                                                {isActive && (
                                                    <View style={{
                                                        backgroundColor: primaryColor + '25',
                                                        paddingHorizontal: 8, paddingVertical: 2,
                                                        borderRadius: 8,
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 10, fontWeight: '700',
                                                            color: primaryColor, fontFamily: 'TTFirsNeue',
                                                        }}>
                                                            CURRENT
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={{
                                                fontSize: 12, color: textMuted,
                                                fontFamily: 'TTFirsNeue', marginTop: 2,
                                            }}>
                                                {cfg.desc}
                                            </Text>
                                        </View>

                                        {/* Right side */}
                                        {isLoading
                                            ? <ActivityIndicator size="small" color={primaryColor} />
                                            : <Ionicons name="chevron-forward" size={20} color={textMuted} />
                                        }
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default RolePickerModal
