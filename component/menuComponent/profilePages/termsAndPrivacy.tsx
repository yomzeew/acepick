import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from "react-native"
import EmptyView from "component/emptyview"
import { Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useState } from "react"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system"

// ── Document data ─────────────────────────────────────────────────────────────
const DOCUMENTS = [
    {
        id: "terms",
        title: "Terms of Service",
        subtitle: "Usage rights & responsibilities",
        icon: "file-document-outline" as const,
        iconLib: "mci",
        accentColor: "#6366F1",
        sections: [
            {
                heading: "1. Acceptance of Terms",
                body: "By accessing and using AcePick, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree, please do not use our services.",
            },
            {
                heading: "2. Use License",
                body: "Permission is granted to temporarily use the materials on AcePick for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title.",
            },
            {
                heading: "3. Disclaimer",
                body: "The materials on AcePick are provided on an 'as is' basis. AcePick makes no warranties, expressed or implied, and disclaims all other warranties including implied warranties of merchantability or fitness for a particular purpose.",
            },
            {
                heading: "4. Limitations",
                body: "In no event shall AcePick or its suppliers be liable for any damages (including loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AcePick.",
            },
            {
                heading: "5. Revisions and Errata",
                body: "The materials appearing on AcePick could include technical, typographical, or photographic errors. AcePick does not warrant that any of the materials on its platform are accurate, complete, or current.",
            },
            {
                heading: "6. Governing Law",
                body: "These terms and conditions are governed by and construed in accordance with the laws of Nigeria. You irrevocably submit to the exclusive jurisdiction of the courts in that location.",
            },
        ],
    },
    {
        id: "privacy",
        title: "Privacy Policy",
        subtitle: "How we handle your data",
        icon: "shield-check-outline" as const,
        iconLib: "mci",
        accentColor: "#10B981",
        sections: [
            {
                heading: "1. Information We Collect",
                body: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.",
            },
            {
                heading: "2. How We Use Your Information",
                body: "We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you.",
            },
            {
                heading: "3. Information Sharing",
                body: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.",
            },
            {
                heading: "4. Data Security",
                body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
            },
            {
                heading: "5. Your Rights",
                body: "You have the right to access, update, or delete your personal information at any time from your profile settings. You may also opt out of certain communications from us.",
            },
            {
                heading: "6. Children's Privacy",
                body: "Our services are not intended for children under 18. We do not knowingly collect personal information from children under 18.",
            },
            {
                heading: "7. Changes to This Policy",
                body: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.",
            },
        ],
    },
    {
        id: "cookies",
        title: "Cookie Policy",
        subtitle: "Cookies & tracking technologies",
        icon: "cookie" as const,
        iconLib: "mci",
        accentColor: "#F59E0B",
        sections: [
            {
                heading: "1. What Are Cookies",
                body: "Cookies are small text files that are placed on your device when you visit our website or use our services to improve your experience.",
            },
            {
                heading: "2. How We Use Cookies",
                body: "We use cookies to remember your preferences, understand how you use our services, provide personalized content, and improve our platform.",
            },
            {
                heading: "3. Types of Cookies We Use",
                body: "Essential cookies (required for core functions), Performance cookies (usage analytics), Functional cookies (personalized features), and Marketing cookies (relevant advertisements).",
            },
            {
                heading: "4. Managing Cookies",
                body: "You can control and delete cookies at any time from your browser or device settings. Note that disabling cookies may affect some features of our services.",
            },
            {
                heading: "5. Third-Party Cookies",
                body: "Some cookies are placed by third-party services that appear on our pages. We use these services to provide analytics and improve the platform experience.",
            },
        ],
    },
    {
        id: "agreement",
        title: "User Agreement",
        subtitle: "Rules for using AcePick",
        icon: "handshake-outline" as const,
        iconLib: "mci",
        accentColor: "#8B5CF6",
        sections: [
            {
                heading: "1. Account Registration",
                body: "You must provide accurate, complete, and current information when registering for an account. Inaccurate information may result in account suspension.",
            },
            {
                heading: "2. Account Security",
                body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            },
            {
                heading: "3. Acceptable Use",
                body: "You agree not to use our services for any unlawful purposes or in any way that could damage, disable, or impair our services or other users' experience.",
            },
            {
                heading: "4. Intellectual Property",
                body: "All content, features, and functionality of our services are owned by AcePick and are protected by international copyright, trademark, and other intellectual property laws.",
            },
            {
                heading: "5. Termination",
                body: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
            },
            {
                heading: "6. Dispute Resolution",
                body: "Any disputes arising from your use of our services will be resolved through binding arbitration in accordance with the laws of Nigeria.",
            },
        ],
    },
]

// ── PDF generator ─────────────────────────────────────────────────────────────
const buildPdfHtml = (doc: (typeof DOCUMENTS)[0]): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${doc.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #1e293b;
      padding: 48px 56px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid ${doc.accentColor};
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .icon-box {
      width: 56px;
      height: 56px;
      background: ${doc.accentColor}22;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .brand { font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
    .title { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .meta { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid ${doc.accentColor};
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: ${doc.accentColor};
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 8px;
    }
    .section-body {
      font-size: 13px;
      color: #475569;
      line-height: 1.75;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand { font-size: 13px; font-weight: 700; color: #0f172a; }
    .footer-meta { font-size: 11px; color: #94a3b8; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div class="icon-box">📄</div>
    <div>
      <div class="brand">AcePick · Legal</div>
      <div class="title">${doc.title}</div>
      <div class="meta">Last updated: January 2025 &nbsp;·&nbsp; Version 1.0</div>
    </div>
  </div>

  ${doc.sections.map((s) => `
  <div class="section">
    <div class="section-title">${s.heading}</div>
    <div class="section-body">${s.body}</div>
  </div>`).join("")}

  <div class="footer">
    <div class="footer-brand">AcePick</div>
    <div class="footer-meta">support@acepick.com<br/>© ${new Date().getFullYear()} AcePick. All rights reserved.</div>
  </div>
</body>
</html>
`

const downloadPdf = async (
    doc: (typeof DOCUMENTS)[0],
    setDownloading: (v: boolean) => void
) => {
    setDownloading(true)
    try {
        // Generate PDF from HTML
        const { uri } = await Print.printToFileAsync({
            html: buildPdfHtml(doc),
            base64: false,
        })

        // Move to a readable location with a proper filename
        const fileName = `AcePick_${doc.title.replace(/\s+/g, "_")}.pdf`
        const destUri = `${FileSystem.documentDirectory}${fileName}`
        await FileSystem.moveAsync({ from: uri, to: destUri })

        // Share / Save to Files
        const canShare = await Sharing.isAvailableAsync()
        if (canShare) {
            await Sharing.shareAsync(destUri, {
                mimeType: "application/pdf",
                dialogTitle: `Save ${doc.title}`,
                UTI: "com.adobe.pdf",
            })
        } else {
            Alert.alert("Saved", `PDF saved to:\n${destUri}`)
        }
    } catch (err: any) {
        Alert.alert("Download Failed", err?.message || "Could not generate PDF. Please try again.")
    } finally {
        setDownloading(false)
    }
}

// ── Document modal ─────────────────────────────────────────────────────────────
const DocumentModal = ({
    visible,
    doc,
    onClose,
    isDark,
    primaryColor,
}: {
    visible: boolean
    doc: (typeof DOCUMENTS)[0] | null
    onClose: () => void
    isDark: boolean
    primaryColor: string
}) => {
    const [downloading, setDownloading] = useState(false)
    if (!doc) return null

    const bg = isDark ? "#0F172A" : "#F8FAFC"
    const cardBg = isDark ? "#1E293B" : "#FFFFFF"
    const textPrimary = isDark ? "#F1F5F9" : "#0F172A"
    const textSecondary = isDark ? "#94A3B8" : "#64748B"
    const border = isDark ? "#334155" : "#E2E8F0"
    const headerBg = isDark ? "#1E293B" : "#FFFFFF"

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={[styles.modalSafe, { backgroundColor: bg }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

                {/* ── Modal header ── */}
                <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: border }]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.modalCloseBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="x" size={18} color={textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.modalHeaderCenter}>
                        <View style={[styles.modalHeaderIcon, { backgroundColor: doc.accentColor + "20" }]}>
                            <MaterialCommunityIcons name={doc.icon} size={16} color={doc.accentColor} />
                        </View>
                        <Text style={[styles.modalHeaderTitle, { color: textPrimary }]}>{doc.title}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => downloadPdf(doc, setDownloading)}
                        disabled={downloading}
                        style={[styles.modalDownloadBtn, { backgroundColor: primaryColor + "18" }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {downloading
                            ? <ActivityIndicator size={14} color={primaryColor} />
                            : <Feather name="download" size={16} color={primaryColor} />
                        }
                    </TouchableOpacity>
                </View>

                {/* ── Content ── */}
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={[styles.modalHero, { backgroundColor: doc.accentColor + "12", borderColor: doc.accentColor + "30" }]}>
                        <View style={[styles.modalHeroIconRing, { backgroundColor: doc.accentColor + "20" }]}>
                            <MaterialCommunityIcons name={doc.icon} size={30} color={doc.accentColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.modalHeroTitle, { color: textPrimary }]}>{doc.title}</Text>
                            <Text style={[styles.modalHeroSub, { color: textSecondary }]}>Last updated: January 2025</Text>
                        </View>
                    </View>

                    {/* Sections */}
                    {doc.sections.map((section, i) => (
                        <View key={i} style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: border }]}>
                            <View style={styles.sectionHeadingRow}>
                                <View style={[styles.sectionDot, { backgroundColor: doc.accentColor }]} />
                                <Text style={[styles.sectionHeading, { color: doc.accentColor }]}>{section.heading}</Text>
                            </View>
                            <Text style={[styles.sectionBody, { color: textSecondary }]}>{section.body}</Text>
                        </View>
                    ))}

                    {/* Footer note */}
                    <View style={[styles.modalFooterNote, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: border }]}>
                        <Feather name="info" size={13} color={textSecondary} style={{ marginTop: 1 }} />
                        <Text style={[styles.modalFooterText, { color: textSecondary }]}>
                            For questions about this document, contact us at{" "}
                            <Text style={{ color: primaryColor }}>support@acepick.com</Text>
                        </Text>
                    </View>
                </ScrollView>

                {/* ── Close button ── */}
                <View style={[styles.modalFooterBar, { backgroundColor: headerBg, borderTopColor: border }]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.modalCloseFullBtn, { backgroundColor: primaryColor }]}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.modalCloseBtnText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

// ── Main screen ───────────────────────────────────────────────────────────────
const TermsAndPrivacy = () => {
    const { theme } = useTheme()
    const { primaryColor } = getColors(theme)
    const isDark = theme === "dark"

    const bg = isDark ? "#0F172A" : "#F8FAFC"
    const cardBg = isDark ? "#1E293B" : "#FFFFFF"
    const textPrimary = isDark ? "#F1F5F9" : "#0F172A"
    const textSecondary = isDark ? "#94A3B8" : "#64748B"
    const border = isDark ? "#334155" : "#E2E8F0"

    const [selectedDoc, setSelectedDoc] = useState<(typeof DOCUMENTS)[0] | null>(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const openDoc = (id: string) => {
        const doc = DOCUMENTS.find((d) => d.id === id) || null
        setSelectedDoc(doc)
        setModalVisible(true)
    }

    const closeDoc = () => {
        setModalVisible(false)
        setTimeout(() => setSelectedDoc(null), 300)
    }

    return (
        <>
            <DocumentModal
                visible={modalVisible}
                doc={selectedDoc}
                onClose={closeDoc}
                isDark={isDark}
                primaryColor={primaryColor}
            />

            <ContainerTemplate>
                <HeaderComponent title="Terms & Privacy" />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    style={{ backgroundColor: bg }}
                >
                    {/* ── Hero banner ── */}
                    <View style={[styles.heroBanner, { backgroundColor: primaryColor + "14", borderColor: primaryColor + "25" }]}>
                        <View style={[styles.heroIconRing, { backgroundColor: primaryColor + "20" }]}>
                            <View style={[styles.heroIconInner, { backgroundColor: primaryColor + "30" }]}>
                                <MaterialIcons name="privacy-tip" size={28} color={primaryColor} />
                            </View>
                        </View>
                        <Text style={[styles.heroTitle, { color: textPrimary }]}>Legal Information</Text>
                        <Text style={[styles.heroSubtitle, { color: textSecondary }]}>
                            Read our policies to understand your rights and responsibilities when using AcePick.
                        </Text>
                    </View>

                    {/* ── Documents section ── */}
                    <View style={styles.sectionBlock}>
                        <Text style={[styles.sectionLabel, { color: textSecondary }]}>DOCUMENTS</Text>

                        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor: border }]}>
                            {DOCUMENTS.map((doc, index) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    onPress={() => openDoc(doc.id)}
                                    activeOpacity={0.65}
                                    style={[
                                        styles.docRow,
                                        index < DOCUMENTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
                                    ]}
                                >
                                    {/* Left icon */}
                                    <View style={[styles.docIconWrap, { backgroundColor: doc.accentColor + "18" }]}>
                                        <MaterialCommunityIcons name={doc.icon} size={20} color={doc.accentColor} />
                                    </View>

                                    {/* Text */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.docTitle, { color: textPrimary }]}>{doc.title}</Text>
                                        <Text style={[styles.docSubtitle, { color: textSecondary }]}>{doc.subtitle}</Text>
                                    </View>

                                    {/* Download */}
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            const d = DOCUMENTS.find((x) => x.id === doc.id)!
                                            downloadPdf(d, (v) => setDownloadingId(v ? doc.id : null))
                                        }}
                                        disabled={downloadingId === doc.id}
                                        style={[styles.docChevron, { backgroundColor: isDark ? "#334155" : "#F1F5F9", marginRight: 6 }]}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        {downloadingId === doc.id
                                            ? <ActivityIndicator size={13} color={doc.accentColor} />
                                            : <Feather name="download" size={14} color={textSecondary} />
                                        }
                                    </TouchableOpacity>

                                    {/* Chevron */}
                                    <View style={[styles.docChevron, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
                                        <Feather name="chevron-right" size={15} color={textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── About section ── */}
                    <View style={styles.sectionBlock}>
                        <Text style={[styles.sectionLabel, { color: textSecondary }]}>ABOUT</Text>

                        <View style={[styles.listCard, { backgroundColor: cardBg, borderColor: border }]}>
                            {[
                                { label: "App Version", value: "1.0.0", icon: "layers" as const },
                                { label: "Last Updated", value: "January 2025", icon: "calendar" as const },
                                { label: "Support", value: "support@acepick.com", icon: "mail" as const },
                            ].map((item, index, arr) => (
                                <View
                                    key={item.label}
                                    style={[
                                        styles.aboutRow,
                                        index < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
                                    ]}
                                >
                                    <View style={[styles.aboutIcon, { backgroundColor: primaryColor + "18" }]}>
                                        <Feather name={item.icon as any} size={15} color={primaryColor} />
                                    </View>
                                    <Text style={[styles.aboutLabel, { color: textSecondary }]}>{item.label}</Text>
                                    <Text style={[styles.aboutValue, { color: textPrimary }]}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ── Security note ── */}
                    <View style={[styles.secNote, { backgroundColor: "#10B98112", borderColor: "#10B98130" }]}>
                        <Feather name="shield" size={14} color="#10B981" style={{ marginTop: 1 }} />
                        <Text style={[styles.secNoteText, { color: textSecondary }]}>
                            Your data is encrypted and protected. AcePick never sells your personal information to third parties.
                        </Text>
                    </View>
                </ScrollView>
            </ContainerTemplate>
        </>
    )
}

export default TermsAndPrivacy

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Hero
    heroBanner: {
        margin: 16,
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        alignItems: "center",
    },
    heroIconRing: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    heroIconInner: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: "center", justifyContent: "center",
    },
    heroTitle: { fontSize: 20, fontWeight: "800", fontFamily: "TTFirsNeueMedium", marginBottom: 6 },
    heroSubtitle: { fontSize: 13, fontFamily: "TTFirsNeue", textAlign: "center", lineHeight: 20 },

    // Section
    sectionBlock: { marginHorizontal: 16, marginBottom: 16 },
    sectionLabel: {
        fontSize: 11, fontWeight: "700", fontFamily: "TTFirsNeueMedium",
        letterSpacing: 0.8, marginBottom: 8, marginLeft: 2,
    },
    listCard: {
        borderRadius: 18, borderWidth: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
        overflow: "hidden",
    },

    // Doc row
    docRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    docIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    docTitle: { fontSize: 14, fontWeight: "700", fontFamily: "TTFirsNeueMedium", marginBottom: 2 },
    docSubtitle: { fontSize: 12, fontFamily: "TTFirsNeue" },
    docChevron: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },

    // About row
    aboutRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
    aboutIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    aboutLabel: { flex: 1, fontSize: 13, fontFamily: "TTFirsNeue" },
    aboutValue: { fontSize: 13, fontWeight: "600", fontFamily: "TTFirsNeueMedium" },

    // Security note
    secNote: {
        marginHorizontal: 16, marginBottom: 8, borderRadius: 14,
        borderWidth: 1, flexDirection: "row", gap: 10,
        paddingHorizontal: 14, paddingVertical: 12,
    },
    secNoteText: { flex: 1, fontSize: 12, fontFamily: "TTFirsNeue", lineHeight: 18 },

    // Modal
    modalSafe: { flex: 1 },
    modalHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1,
    },
    modalCloseBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    modalHeaderCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
    modalHeaderIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    modalHeaderTitle: { fontSize: 15, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
    modalDownloadBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },

    modalHero: {
        flexDirection: "row", alignItems: "center", gap: 14,
        borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    },
    modalHeroIconRing: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    modalHeroTitle: { fontSize: 16, fontWeight: "700", fontFamily: "TTFirsNeueMedium", marginBottom: 3 },
    modalHeroSub: { fontSize: 12, fontFamily: "TTFirsNeue" },

    sectionCard: {
        borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
    },
    sectionHeadingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    sectionDot: { width: 4, height: 16, borderRadius: 2 },
    sectionHeading: { fontSize: 13, fontWeight: "700", fontFamily: "TTFirsNeueMedium", flex: 1 },
    sectionBody: { fontSize: 13, fontFamily: "TTFirsNeue", lineHeight: 21 },

    modalFooterNote: {
        flexDirection: "row", gap: 8, borderRadius: 12,
        borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6,
    },
    modalFooterText: { flex: 1, fontSize: 12, fontFamily: "TTFirsNeue", lineHeight: 18 },

    modalFooterBar: {
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, borderTopWidth: 1,
    },
    modalCloseFullBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
    modalCloseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "TTFirsNeueMedium" },
})
