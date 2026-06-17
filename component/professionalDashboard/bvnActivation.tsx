import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import BackComponent from "component/backcomponent"
import ButtonComponent from "component/buttoncomponent"
import ButtonFunction from "component/buttonfunction"
import BVNInfoModal from "component/controls/bvnInfoModal"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useBVNInfoModal } from "hooks/useBVNInfoModal"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "context/ToastContext"
import { verifyBVN, BVNVerificationRequest } from "services/bvnServices"
import DateTimePicker from "@react-native-community/datetimepicker"

const BvNActivation = () => {
    const router = useRouter()
    const [showmodal, setshowmodal] = useState<boolean>(false)
    const [bvn, setBvn] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [bvnError, setBvnError] = useState<string | null>(null)
    const [bvnFocused, setBvnFocused] = useState(false)
    const { theme } = useTheme()
    const {
        primaryColor,
        secondaryTextColor,
        backgroundColor,
        subText,
        borderColor,
    } = getColors(theme)
    const isDark = theme === "dark"
    const toast = useToast()
    const { showInfoModal, showBVNInfo, hideBVNInfo } = useBVNInfoModal()

    const cardBg = isDark ? "#1F2937" : "#FFFFFF"
    const cardBorder = isDark ? "#374151" : "#E5E7EB"
    const inputBg = isDark ? "#111827" : "#F9FAFB"

    // ── Validation ───────────────────────────────────────────────────────────────
    const validateBVN = (value: string): string | null => {
        const clean = value.replace(/[^0-9]/g, "")
        if (!clean) return "BVN is required"
        if (clean.length !== 11) return "BVN must be exactly 11 digits"
        if (clean.startsWith("0")) return "BVN cannot start with 0"
        if (/^(\d)\1{10}$/.test(clean)) return "Invalid BVN format"
        return null
    }

    const handleBvnChange = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, "")
        setBvn(numeric)
        if (numeric.length > 0) setBvnError(validateBVN(numeric))
        else setBvnError(null)
    }

    // ── Date helpers ─────────────────────────────────────────────────────────────
    const formatDateForAPI = (date: Date): string => {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`
    }

    const formatDateForDisplay = (date: Date): string =>
        date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })

    // ── Mutation ─────────────────────────────────────────────────────────────────
    const bvnMutation = useMutation({
        mutationFn: (data: BVNVerificationRequest) => verifyBVN(data),
        onSuccess: (response) => {
            if (response.isVerified) {
                toast.success("BVN Verified", "Your BVN has been verified successfully")
                setshowmodal(true)
            } else {
                const { matchDetails } = response
                let msg = "BVN verification failed. "
                if (!matchDetails.name.isMatch) msg += `Name mismatch (${matchDetails.name.status}). `
                if (!matchDetails.dateOfBirth.isMatch) msg += "Date of birth does not match. "
                if (!matchDetails.mobileNo.isMatch) msg += "Mobile number does not match. "
                toast.error("Verification Failed", msg)
            }
        },
        onError: (error: any) => {
            toast.error("Verification Failed", error?.message || "BVN verification failed. Please try again.")
        },
    })

    const handleActivate = () => {
        const err = validateBVN(bvn)
        if (err) { setBvnError(err); toast.error("Invalid BVN", err); return }
        if (dateOfBirth > new Date()) { toast.error("Invalid Date", "Date of birth cannot be in the future"); return }
        bvnMutation.mutate({ bvn: bvn.replace(/[^0-9]/g, ""), dateOfBirth: formatDateForAPI(dateOfBirth) })
    }

    const handleDateChange = (_: any, selected?: Date) => {
        setShowDatePicker(false)
        if (selected) setDateOfBirth(selected)
    }

    const isReady = bvn.length === 11 && !bvnError && !bvnMutation.isPending

    return (
        <>
            {showmodal && (
                <SliderModalTemplate modalHeight="60%" showmodal={showmodal} setshowmodal={setshowmodal}>
                    <SlideupContent router={router} setshowmodal={setshowmodal} />
                </SliderModalTemplate>
            )}
            <BVNInfoModal visible={showInfoModal} onClose={hideBVNInfo} />

            <ContainerTemplate>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Nav ── */}
                        <View style={styles.navRow}>
                            <BackComponent bordercolor={primaryColor} textcolor={primaryColor} />
                        </View>

                        {/* ── Hero ── */}
                        <View style={styles.hero}>
                            <View style={[styles.iconRing, { backgroundColor: primaryColor + "18", borderColor: primaryColor + "30" }]}>
                                <View style={[styles.iconInner, { backgroundColor: primaryColor + "28" }]}>
                                    <Feather name="shield" size={32} color={primaryColor} />
                                </View>
                            </View>
                            <EmptyView height={20} />
                            <Text style={[styles.heroTitle, { color: primaryColor }]}>Account Activation</Text>
                            <EmptyView height={8} />
                            <Text style={[styles.heroSubtitle, { color: subText }]}>
                                Enter your Bank Verification Number (BVN) and Date of Birth to activate your account and unlock all features.
                            </Text>
                        </View>

                        {/* ── Form card ── */}
                        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>

                            {/* BVN input */}
                            <Text style={[styles.fieldLabel, { color: subText }]}>Bank Verification Number</Text>
                            <EmptyView height={8} />
                            <View style={[
                                styles.inputWrap,
                                {
                                    backgroundColor: inputBg,
                                    borderColor: bvnError
                                        ? "#EF4444"
                                        : bvnFocused
                                            ? primaryColor
                                            : cardBorder,
                                    borderWidth: bvnFocused || !!bvnError ? 1.5 : 1,
                                },
                            ]}>
                                <Feather
                                    name="credit-card"
                                    size={16}
                                    color={bvnFocused ? primaryColor : subText}
                                    style={{ marginRight: 10 }}
                                />
                                <TextInput
                                    style={[styles.textInput, { color: isDark ? "#F9FAFB" : "#111827" }]}
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
                                    <Text style={[styles.charCount, { color: bvn.length === 11 ? "#10B981" : subText }]}>
                                        {bvn.length}/11
                                    </Text>
                                )}
                            </View>
                            {bvnError ? (
                                <View style={styles.errorRow}>
                                    <Feather name="alert-circle" size={12} color="#EF4444" />
                                    <Text style={styles.errorText}>{bvnError}</Text>
                                </View>
                            ) : null}

                            <EmptyView height={20} />

                            {/* Date of birth */}
                            <Text style={[styles.fieldLabel, { color: subText }]}>Date of Birth</Text>
                            <EmptyView height={8} />
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.75}
                                style={[styles.datePicker, { backgroundColor: inputBg, borderColor: cardBorder }]}
                            >
                                <Feather name="calendar" size={16} color={subText} style={{ marginRight: 10 }} />
                                <Text style={[styles.dateText, { color: isDark ? "#F9FAFB" : "#111827" }]}>
                                    {formatDateForDisplay(dateOfBirth)}
                                </Text>
                                <Feather name="chevron-down" size={16} color={subText} />
                            </TouchableOpacity>

                            <EmptyView height={20} />

                            {/* Why BVN? */}
                            <TouchableOpacity onPress={showBVNInfo} style={styles.infoRow} activeOpacity={0.7}>
                                <View style={[styles.infoBadge, { backgroundColor: primaryColor + "18" }]}>
                                    <Feather name="info" size={13} color={primaryColor} />
                                </View>
                                <Text style={[styles.infoText, { color: primaryColor }]}>
                                    Why should I provide my BVN?
                                </Text>
                                <Feather name="chevron-right" size={14} color={primaryColor} style={{ marginLeft: "auto" }} />
                            </TouchableOpacity>
                        </View>

                        {/* ── Security note ── */}
                        <View style={[styles.securityNote, { backgroundColor: primaryColor + "0E", borderColor: primaryColor + "25" }]}>
                            <Feather name="lock" size={13} color={primaryColor} style={{ marginTop: 1 }} />
                            <Text style={[styles.securityText, { color: subText }]}>
                                Your BVN is encrypted and used only for identity verification. We never share it with third parties.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* ── Date picker ── */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={dateOfBirth}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )}
                </KeyboardAvoidingView>

                {/* ── CTA ── */}
                <View style={[styles.ctaBar, { backgroundColor, borderTopColor: cardBorder }]}>
                    <TouchableOpacity
                        onPress={handleActivate}
                        disabled={!isReady}
                        activeOpacity={0.85}
                        style={[
                            styles.ctaButton,
                            { backgroundColor: isReady ? primaryColor : primaryColor + "50" },
                        ]}
                    >
                        {bvnMutation.isPending ? (
                            <View style={styles.ctaLoading}>
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text style={styles.ctaText}>Verifying…</Text>
                            </View>
                        ) : (
                            <View style={styles.ctaLoading}>
                                <Feather name="shield" size={18} color="#ffffff" />
                                <Text style={styles.ctaText}>Activate Account</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ContainerTemplate>
        </>
    )
}

export default BvNActivation

// ─── Success slide-up ────────────────────────────────────────────────────────

const DASHBOARD_ROUTES: Record<string, string> = {
    professional: '/(Authenticated)/(professionalLayout)/(professionaldashboard)/homeprofessionalayout',
    client:       '/(Authenticated)/(dashboard)/homelayout',
    corperate:    '/(Authenticated)/(dashboard)/homelayout',
    delivery:     '/(Authenticated)/(delivery)/deliverydashboardlayout',
}

const SlideupContent = ({ router, setshowmodal }: { router: any; setshowmodal: (v: boolean) => void }) => {
    const { theme } = useTheme()
    const { primaryColor } = getColors(theme)
    const isDark = theme === "dark"
    const subTextColor = isDark ? "#9CA3AF" : "#6B7280"
    const role = useSelector((state: RootState) => state.auth.user?.role ?? 'client')

    const subtitleText = role === 'delivery'
        ? "Your account has been verified. You can now accept delivery orders."
        : role === 'professional'
        ? "Your account has been verified and activated. You're now visible to clients and can start receiving job requests."
        : "Your account has been verified. You can now perform transactions."

    const handleGoToDashboard = () => {
        const route = DASHBOARD_ROUTES[role] ?? DASHBOARD_ROUTES.client
        setshowmodal(false)
        if (router.canDismiss()) router.dismissAll()
        router.replace(route as any)
    }

    return (
        <View style={slideStyles.wrap}>
            <EmptyView height={20} />
            <View style={[slideStyles.iconRing, { backgroundColor: "#10B981" + "18", borderColor: "#10B981" + "30" }]}>
                <View style={[slideStyles.iconInner, { backgroundColor: "#10B981" + "28" }]}>
                    <MaterialCommunityIcons name="check-decagram" size={38} color="#10B981" />
                </View>
            </View>
            <EmptyView height={20} />
            <Text style={[slideStyles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
                Activation Successful!
            </Text>
            <EmptyView height={8} />
            <Text style={[slideStyles.subtitle, { color: subTextColor }]}>
                {subtitleText}
            </Text>
            <EmptyView height={32} />
            <TouchableOpacity
                onPress={handleGoToDashboard}
                style={[slideStyles.btn, { backgroundColor: primaryColor }]}
                activeOpacity={0.85}
            >
                <Text style={slideStyles.btnText}>Go to Dashboard</Text>
                <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </View>
    )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    navRow: { paddingTop: 56, paddingHorizontal: 16 },

    hero: { alignItems: "center", paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 },
    iconRing: {
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 1.5, alignItems: "center", justifyContent: "center",
    },
    iconInner: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: "center", justifyContent: "center",
    },
    heroTitle: { fontSize: 22, fontWeight: "800", fontFamily: "TTFirsNeueMedium", textAlign: "center" },
    heroSubtitle: {
        fontSize: 14, fontFamily: "TTFirsNeue", textAlign: "center", lineHeight: 22, marginTop: 2,
    },

    formCard: {
        marginHorizontal: 16, borderRadius: 20, borderWidth: 1,
        padding: 20, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    fieldLabel: { fontSize: 12, fontFamily: "TTFirsNeueMedium", fontWeight: "600", letterSpacing: 0.3 },

    inputWrap: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    },
    textInput: { flex: 1, fontSize: 15, fontFamily: "TTFirsNeue", padding: 0 },
    charCount: { fontSize: 11, fontFamily: "TTFirsNeue", marginLeft: 8 },

    errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, paddingHorizontal: 2 },
    errorText: { fontSize: 12, color: "#EF4444", fontFamily: "TTFirsNeue" },

    datePicker: {
        flexDirection: "row", alignItems: "center", borderRadius: 14,
        borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14,
    },
    dateText: { flex: 1, fontSize: 15, fontFamily: "TTFirsNeue" },

    infoRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 12, paddingHorizontal: 14,
        borderRadius: 12,
    },
    infoBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    infoText: { fontSize: 13, fontFamily: "TTFirsNeueMedium", fontWeight: "600" },

    securityNote: {
        marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
        borderWidth: 1, flexDirection: "row", alignItems: "flex-start",
        gap: 10, paddingHorizontal: 14, paddingVertical: 12,
    },
    securityText: { flex: 1, fontSize: 12, fontFamily: "TTFirsNeue", lineHeight: 18 },

    ctaBar: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32,
        borderTopWidth: 1,
    },
    ctaButton: {
        borderRadius: 18, paddingVertical: 18,
        alignItems: "center", justifyContent: "center",
    },
    ctaLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
    ctaText: { fontSize: 16, fontWeight: "700", fontFamily: "TTFirsNeueMedium", color: "#ffffff" },
})

const slideStyles = StyleSheet.create({
    wrap: { flex: 1, width: "100%", paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
    iconRing: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 1.5, alignItems: "center", justifyContent: "center",
    },
    iconInner: {
        width: 76, height: 76, borderRadius: 38,
        alignItems: "center", justifyContent: "center",
    },
    title: { fontSize: 22, fontWeight: "800", fontFamily: "TTFirsNeueMedium", textAlign: "center" },
    subtitle: { fontSize: 14, fontFamily: "TTFirsNeue", textAlign: "center", lineHeight: 22 },
    btn: {
        width: "100%", borderRadius: 18, paddingVertical: 18,
        flexDirection: "row", alignItems: "center", justifyContent: "center",
    },
    btnText: { fontSize: 16, fontWeight: "700", fontFamily: "TTFirsNeueMedium", color: "#ffffff" },
})
