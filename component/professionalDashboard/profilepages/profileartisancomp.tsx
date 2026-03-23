import { Ionicons, Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { useCallback } from "react"
import { TouchableOpacity, View, Text, ScrollView, Image } from "react-native"
import { getColors } from "static/color"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useDashboard } from "hooks/useDashboard"
import { useFocusEffect } from "@react-navigation/native"

const ArtisanSettingsComp = () => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, backgroundColor, backgroundColortwo } = getColors(theme)
    const router = useRouter()
    const user = useSelector((state: RootState) => state?.auth?.user)
    const profile = user?.profile
    const professional = profile?.professional
    const { refresh } = useDashboard()

    useFocusEffect(
        useCallback(() => {
            refresh()
        }, [])
    )

    const isDark = theme === "dark"
    const cardBg = isDark ? "#1F2937" : "#FFFFFF"
    const textPrimary = isDark ? "#F9FAFB" : "#111827"
    const dividerColor = isDark ? "#374151" : "#E5E7EB"

    const intro = professional?.intro || ''
    const professionTitle = professional?.profession?.title || 'Not set'
    const sectorTitle = professional?.profession?.sector?.title || ''
    const yearsOfExp = professional?.yearsOfExp || 0
    const language = professional?.language || ''
    const workType = professional?.workType || ''
    const experience = profile?.experience || []
    const education = profile?.education || []
    const certifications = profile?.certifications || []
    const portfolios = profile?.portfolios || []

    const SectionHeader = ({ title, icon, editRoute }: { title: string; icon: string; editRoute: string }) => (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ backgroundColor: primaryColor + "15", width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                    <Feather name={icon as any} size={16} color={primaryColor} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: textPrimary }}>{title}</Text>
            </View>
            <TouchableOpacity
                onPress={() => router.push(editRoute as any)}
                style={{ backgroundColor: primaryColor, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 }}
            >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
        </View>
    )

    const EmptyState = ({ message }: { message: string }) => (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: secondaryTextColor, fontStyle: "italic" }}>{message}</Text>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#F3F4F6" }}>
            {/* Header */}
            <View style={{
                backgroundColor: primaryColor,
                paddingTop: 52, paddingBottom: 20,
                paddingHorizontal: 20,
                borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
            }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 12 }}>Professional Profile</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
            >
                {/* Overview / About */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Overview" icon="user" editRoute="/overViewLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: textPrimary, marginBottom: 4 }}>About</Text>
                    {intro ? (
                        <Text style={{ fontSize: 12, color: secondaryTextColor, lineHeight: 18 }}>{intro}</Text>
                    ) : (
                        <EmptyState message="Add an introduction to tell clients about yourself" />
                    )}
                    {workType ? (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                            <Feather name="briefcase" size={12} color={secondaryTextColor} />
                            <Text style={{ fontSize: 11, color: secondaryTextColor, marginLeft: 6 }}>Work type: {workType}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Profession */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Profession" icon="tool" editRoute="/professionalLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    <View style={{
                        backgroundColor: primaryColor + "08",
                        borderColor: primaryColor + "20", borderWidth: 1,
                        borderRadius: 14, padding: 14,
                    }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: "700", color: textPrimary }}>{professionTitle}</Text>
                                {sectorTitle ? (
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2 }}>{sectorTitle}</Text>
                                ) : null}
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Feather name="clock" size={12} color={primaryColor} />
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: primaryColor }}>{yearsOfExp} yrs</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Work Experience */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Work Experience" icon="award" editRoute="/workExpLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    {experience.length > 0 ? experience.map((exp: any, index: number) => (
                        <View key={exp.id || index} style={{ marginBottom: index < experience.length - 1 ? 14 : 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <View style={{ backgroundColor: primaryColor + '15', width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Feather name="briefcase" size={16} color={primaryColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: textPrimary }}>{exp.postHeld || 'Position'}</Text>
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>{exp.workPlace || 'Company'}</Text>
                                    <Text style={{ fontSize: 10, color: secondaryTextColor + "80", marginTop: 2 }}>
                                        {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                    </Text>
                                    {exp.description ? (
                                        <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 4, lineHeight: 16 }} numberOfLines={2}>{exp.description}</Text>
                                    ) : null}
                                </View>
                            </View>
                            {index < experience.length - 1 && <View style={{ backgroundColor: dividerColor, height: 1, marginTop: 12 }} />}
                        </View>
                    )) : (
                        <EmptyState message="Add your work experience" />
                    )}
                </View>

                {/* Portfolio */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Portfolio" icon="image" editRoute="/portfolioLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    {portfolios.length > 0 ? portfolios.map((item: any, index: number) => (
                        <View key={item.id || index} style={{ marginBottom: index < portfolios.length - 1 ? 14 : 0 }}>
                            <Text style={{ fontSize: 13, fontWeight: "600", color: textPrimary }}>{item.title || 'Project'}</Text>
                            {item.description ? (
                                <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 2, lineHeight: 16 }} numberOfLines={2}>{item.description}</Text>
                            ) : null}
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Feather name="calendar" size={10} color={secondaryTextColor} />
                                    <Text style={{ fontSize: 10, color: secondaryTextColor }}>
                                        {item.date ? new Date(item.date).toLocaleDateString() : ''}
                                    </Text>
                                </View>
                            </View>
                            {item.file && (
                                <View style={{ marginTop: 8, flexDirection: "row" }}>
                                    <Image
                                        source={{ uri: item.file }}
                                        style={{
                                            width: 64, height: 64, borderRadius: 10,
                                            backgroundColor: dividerColor,
                                        }}
                                    />
                                </View>
                            )}
                            {index < portfolios.length - 1 && <View style={{ backgroundColor: dividerColor, height: 1, marginTop: 12 }} />}
                        </View>
                    )) : (
                        <EmptyState message="Showcase your best work" />
                    )}
                </View>

                {/* Education */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Education" icon="book-open" editRoute="/educationLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    {education.length > 0 ? education.map((edu: any, index: number) => (
                        <View key={edu.id || index} style={{ marginBottom: index < education.length - 1 ? 14 : 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <View style={{ backgroundColor: primaryColor + '15', width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Feather name="book" size={16} color={primaryColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: textPrimary }}>{edu.school || 'Institution'}</Text>
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>
                                        {edu.degreeType || ''}{edu.course ? ` - ${edu.course}` : ''}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: secondaryTextColor + "80", marginTop: 2 }}>
                                        {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.gradDate ? new Date(edu.gradDate).getFullYear() : 'Present'}
                                    </Text>
                                </View>
                            </View>
                            {index < education.length - 1 && <View style={{ backgroundColor: dividerColor, height: 1, marginTop: 12 }} />}
                        </View>
                    )) : (
                        <EmptyState message="Add your education background" />
                    )}
                </View>

                {/* Languages */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Languages" icon="globe" editRoute="/languageLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    {language ? (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {language.split(',').map((lang: string, index: number) => (
                                <View key={index} style={{
                                    backgroundColor: primaryColor + "15",
                                    borderColor: primaryColor + "30", borderWidth: 1,
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: primaryColor }}>{lang.trim()}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <EmptyState message="Add languages you speak" />
                    )}
                </View>

                {/* Certifications */}
                <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <SectionHeader title="Certifications" icon="shield" editRoute="/certificationLayoutEdit" />
                    <View style={{ backgroundColor: dividerColor, height: 1, marginBottom: 12 }} />
                    {certifications.length > 0 ? certifications.map((cert: any, index: number) => (
                        <View key={cert.id || index} style={{ marginBottom: index < certifications.length - 1 ? 14 : 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <View style={{ backgroundColor: backgroundColortwo + '15', width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                                    <Feather name="award" size={16} color={backgroundColortwo} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: textPrimary }}>{cert.title || 'Certification'}</Text>
                                    <Text style={{ fontSize: 11, color: secondaryTextColor, marginTop: 1 }}>{cert.companyIssue || ''}</Text>
                                    {cert.date ? (
                                        <Text style={{ fontSize: 10, color: secondaryTextColor + "80", marginTop: 2 }}>
                                            Issued: {new Date(cert.date).toLocaleDateString()}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                            {index < certifications.length - 1 && <View style={{ backgroundColor: dividerColor, height: 1, marginTop: 12 }} />}
                        </View>
                    )) : (
                        <EmptyState message="Add your certifications" />
                    )}
                </View>
            </ScrollView>
        </View>
    )
}
export default ArtisanSettingsComp