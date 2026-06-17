import EmptyView from "component/emptyview"
import BVNInfoModal from "component/controls/bvnInfoModal"
import { useTheme } from "hooks/useTheme"
import { useBVNInfoModal } from "hooks/useBVNInfoModal"
import { useState } from "react"
import {
    Text, TextInput, TouchableOpacity, ActivityIndicator,
    View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native"
import { getColors } from "static/color"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "context/ToastContext"
import { verifyBVN, BVNVerificationRequest } from "services/bvnServices"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Feather } from "@expo/vector-icons"

const VerificationComponent = ({ setshowmodal, setshowmodalVerify }: { setshowmodal: (value: boolean) => void, setshowmodalVerify: (value: boolean) => void }) => {
    const [bvn, setBvn] = useState<string>('')
    const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [bvnError, setBvnError] = useState<string | null>(null)
    const [bvnFocused, setBvnFocused] = useState(false)
    const { theme } = useTheme()
    const { primaryColor, backgroundColor, secondaryTextColor } = getColors(theme)
    const isDark = theme === 'dark'
    const toast = useToast()
    const { showInfoModal, showBVNInfo, hideBVNInfo } = useBVNInfoModal()

    const cardBg = isDark ? '#1F2937' : '#FFFFFF'
    const cardBorder = isDark ? '#374151' : '#E5E7EB'
    const inputBg = isDark ? '#111827' : '#F9FAFB'
    const subText = secondaryTextColor

    const validateBVN = (value: string): string | null => {
        const clean = value.replace(/[^0-9]/g, '')
        if (!clean) return 'BVN is required'
        if (clean.length !== 11) return 'BVN must be exactly 11 digits'
        if (clean.startsWith('0')) return 'BVN cannot start with 0'
        if (/^(\d)\1{10}$/.test(clean)) return 'Invalid BVN format'
        return null
    }

    const handleBvnChange = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '')
        setBvn(numeric)
        setBvnError(numeric.length > 0 ? validateBVN(numeric) : null)
    }

    const formatDateForAPI = (date: Date): string => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`
    }

    const formatDateForDisplay = (date: Date): string =>
        date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

    const bvnMutation = useMutation({
        mutationFn: (data: BVNVerificationRequest) => verifyBVN(data),
        onSuccess: (response) => {
            if (response.isVerified) {
                toast.success('BVN Verified', 'Your BVN has been verified successfully')
                setshowmodalVerify(true)
            } else {
                const { matchDetails } = response
                let msg = 'BVN verification failed. '
                if (!matchDetails.name.isMatch) msg += `Name mismatch (${matchDetails.name.status}). `
                if (!matchDetails.dateOfBirth.isMatch) msg += 'Date of birth does not match. '
                if (!matchDetails.mobileNo.isMatch) msg += 'Mobile number does not match. '
                toast.error('Verification Failed', msg)
            }
        },
        onError: (error: any) => {
            toast.error('Verification Failed', error?.message || 'BVN verification failed. Please try again.')
        },
    })

    const handleVerify = () => {
        const err = validateBVN(bvn)
        if (err) { setBvnError(err); toast.error('Invalid BVN', err); return }
        if (dateOfBirth > new Date()) { toast.error('Invalid Date', 'Date of birth cannot be in the future'); return }
        bvnMutation.mutate({ bvn: bvn.replace(/[^0-9]/g, ''), dateOfBirth: formatDateForAPI(dateOfBirth) })
    }

    const handleDateChange = (_: any, selected?: Date) => {
        setShowDatePicker(false)
        if (selected) setDateOfBirth(selected)
    }

    const isReady = bvn.length === 11 && !bvnError && !bvnMutation.isPending

    return (
        <>
            <BVNInfoModal visible={showInfoModal} onClose={hideBVNInfo} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Hero ── */}
                    <View style={vStyles.hero}>
                        <View style={[vStyles.iconRing, { backgroundColor: primaryColor + '18', borderColor: primaryColor + '30' }]}>
                            <View style={[vStyles.iconInner, { backgroundColor: primaryColor + '28' }]}>
                                <Feather name="shield" size={28} color={primaryColor} />
                            </View>
                        </View>
                        <EmptyView height={14} />
                        <Text style={[vStyles.heroTitle, { color: primaryColor }]}>BVN Verification</Text>
                        <EmptyView height={6} />
                        <Text style={[vStyles.heroSubtitle, { color: subText }]}>
                            Enter your BVN and Date of Birth to validate your profile update.
                        </Text>
                    </View>

                    {/* ── Form card ── */}
                    <View style={[vStyles.formCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>

                        {/* BVN input */}
                        <Text style={[vStyles.fieldLabel, { color: subText }]}>Bank Verification Number</Text>
                        <EmptyView height={8} />
                        <View style={[
                            vStyles.inputWrap,
                            {
                                backgroundColor: inputBg,
                                borderColor: bvnError ? '#EF4444' : bvnFocused ? primaryColor : cardBorder,
                                borderWidth: bvnFocused || !!bvnError ? 1.5 : 1,
                            },
                        ]}>
                            <Feather name="credit-card" size={16} color={bvnFocused ? primaryColor : subText} style={{ marginRight: 10 }} />
                            <TextInput
                                style={[vStyles.textInput, { color: isDark ? '#F9FAFB' : '#111827' }]}
                                placeholder="Enter your BVN (11 digits)"
                                placeholderTextColor={subText}
                                value={bvn}
                                onChangeText={handleBvnChange}
                                keyboardType="numeric"
                                maxLength={11}
                                onFocus={() => setBvnFocused(true)}
                                onBlur={() => setBvnFocused(false)}
                            />
                            {bvn.length === 11 && !bvnError && (
                                <Feather name="check-circle" size={16} color="#10B981" />
                            )}
                            {bvn.length > 0 && (
                                <Text style={[vStyles.charCount, { color: bvn.length === 11 ? '#10B981' : subText }]}>
                                    {bvn.length}/11
                                </Text>
                            )}
                        </View>
                        {bvnError ? (
                            <View style={vStyles.errorRow}>
                                <Feather name="alert-circle" size={12} color="#EF4444" />
                                <Text style={vStyles.errorText}>{bvnError}</Text>
                            </View>
                        ) : null}

                        <EmptyView height={20} />

                        {/* Date of birth */}
                        <Text style={[vStyles.fieldLabel, { color: subText }]}>Date of Birth</Text>
                        <EmptyView height={8} />
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.75}
                            style={[vStyles.datePicker, { backgroundColor: inputBg, borderColor: cardBorder }]}
                        >
                            <Feather name="calendar" size={16} color={subText} style={{ marginRight: 10 }} />
                            <Text style={[vStyles.dateText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                                {formatDateForDisplay(dateOfBirth)}
                            </Text>
                            <Feather name="chevron-down" size={16} color={subText} />
                        </TouchableOpacity>

                        <EmptyView height={16} />

                        {/* Why BVN? */}
                        <TouchableOpacity onPress={showBVNInfo} style={vStyles.infoRow} activeOpacity={0.7}>
                            <View style={[vStyles.infoBadge, { backgroundColor: primaryColor + '18' }]}>
                                <Feather name="info" size={13} color={primaryColor} />
                            </View>
                            <Text style={[vStyles.infoText, { color: primaryColor }]}>Why should I provide my BVN?</Text>
                            <Feather name="chevron-right" size={14} color={primaryColor} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Security note ── */}
                    <View style={[vStyles.securityNote, { backgroundColor: primaryColor + '0E', borderColor: primaryColor + '25' }]}>
                        <Feather name="lock" size={13} color={primaryColor} style={{ marginTop: 1 }} />
                        <Text style={[vStyles.securityText, { color: subText }]}>
                            Your BVN is encrypted and used only for identity verification. We never share it with third parties.
                        </Text>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dateOfBirth}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── CTA bar ── */}
            <View style={[vStyles.ctaBar, { backgroundColor, borderTopColor: cardBorder }]}>
                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={!isReady}
                    activeOpacity={0.85}
                    style={[vStyles.ctaButton, { backgroundColor: isReady ? primaryColor : primaryColor + '50' }]}
                >
                    {bvnMutation.isPending ? (
                        <View style={vStyles.ctaRow}>
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text style={vStyles.ctaText}>Verifying…</Text>
                        </View>
                    ) : (
                        <View style={vStyles.ctaRow}>
                            <Feather name="shield" size={18} color="#ffffff" />
                            <Text style={vStyles.ctaText}>Verify Now</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <EmptyView height={10} />
                <TouchableOpacity
                    onPress={() => setshowmodal(false)}
                    activeOpacity={0.7}
                    style={[vStyles.cancelBtn, { borderColor: cardBorder }]}
                >
                    <Text style={[vStyles.cancelText, { color: subText }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </>
    )
}

const vStyles = StyleSheet.create({
    hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    iconRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    iconInner: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 20, fontWeight: '800', fontFamily: 'TTFirsNeueMedium', textAlign: 'center' },
    heroSubtitle: { fontSize: 13, fontFamily: 'TTFirsNeue', textAlign: 'center', lineHeight: 20, marginTop: 2 },

    formCard: {
        marginHorizontal: 16, borderRadius: 20, borderWidth: 1,
        padding: 20, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    fieldLabel: { fontSize: 12, fontFamily: 'TTFirsNeueMedium', fontWeight: '600', letterSpacing: 0.3 },

    inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
    textInput: { flex: 1, fontSize: 15, fontFamily: 'TTFirsNeue', padding: 0 },
    charCount: { fontSize: 11, fontFamily: 'TTFirsNeue', marginLeft: 8 },

    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 2 },
    errorText: { fontSize: 12, color: '#EF4444', fontFamily: 'TTFirsNeue' },

    datePicker: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
    dateText: { flex: 1, fontSize: 15, fontFamily: 'TTFirsNeue' },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
    infoBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    infoText: { fontSize: 13, fontFamily: 'TTFirsNeueMedium', fontWeight: '600' },

    securityNote: {
        marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
        borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start',
        gap: 10, paddingHorizontal: 14, paddingVertical: 12,
    },
    securityText: { flex: 1, fontSize: 12, fontFamily: 'TTFirsNeue', lineHeight: 18 },

    ctaBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
    ctaButton: { borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ctaText: { fontSize: 16, fontWeight: '700', fontFamily: 'TTFirsNeueMedium', color: '#ffffff' },

    cancelBtn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1 },
    cancelText: { fontSize: 15, fontFamily: 'TTFirsNeueMedium', fontWeight: '600' },
})

export default VerificationComponent