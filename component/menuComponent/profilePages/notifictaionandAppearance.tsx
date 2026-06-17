import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "../../headerComp"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { Switch, View, ScrollView, TouchableOpacity } from "react-native"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { Textstyles } from "static/textFontsize"
import EmptyView from "component/emptyview"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { updateNotificationPreferencesFn } from "services/userService"

const NotificationAppearance = () => {
    const { theme, toggleTheme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColor } = getColors(theme)

    // Notification states
    const [callNotification, setCallNotification] = useState(true)
    const [messengerNotification, setMessengerNotification] = useState(true)
    const [hireAlertNotification, setHireAlertNotification] = useState(true)
    const [isDarkMode, setIsDarkMode] = useState(theme === "dark")

    const handleToggleTheme = () => {
        toggleTheme()
        setIsDarkMode(!isDarkMode)
    }

    const handleNotificationToggle = async (type: string, value: boolean) => {
        try {
            // Update local state immediately for responsiveness
            switch (type) {
                case 'call':
                    setCallNotification(value)
                    break
                case 'messenger':
                    setMessengerNotification(value)
                    break
                case 'hireAlert':
                    setHireAlertNotification(value)
                    break
            }

            // Update backend
            await updateNotificationPreferencesFn({
                callNotifications: callNotification,
                messengerNotifications: messengerNotification,
                hireAlertNotifications: hireAlertNotification,
            })
        } catch (error) {
            console.error('Failed to update notification preferences:', error)
            // Revert state on error
            switch (type) {
                case 'call':
                    setCallNotification(!value)
                    break
                case 'messenger':
                    setMessengerNotification(!value)
                    break
                case 'hireAlert':
                    setHireAlertNotification(!value)
                    break
            }
        }
    }

    return (
        <>
            <ContainerTemplate>
                <HeaderComponent title="Notification and Appearance" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Notifications Section */}
                    <View style={{ marginHorizontal: 4, marginTop: 8 }}>
                        

                        {/* Call Notification */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                backgroundColor: selectioncardColor,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 3,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    backgroundColor: primaryColor + '15',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Ionicons name="call-outline" size={20} color={primaryColor} />
                                </View>
                                <View>
                                    <ThemeTextsecond size={Textstyles.text_xxmedium}>Call Notifications</ThemeTextsecond>
                                    <ThemeText size={Textstyles.text_xxxsmall} style={{ marginTop: 2 }}>
                                        Receive call alerts
                                    </ThemeText>
                                </View>
                            </View>
                            <Switch
                                thumbColor="#ffffff"
                                trackColor={{ false: "#ccc", true: primaryColor }}
                                value={callNotification}
                                onValueChange={(value) => handleNotificationToggle('call', value)}
                                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                            />
                        </TouchableOpacity>

                        {/* Messenger Notification */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                backgroundColor: selectioncardColor,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 3,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    backgroundColor: primaryColor + '15',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Ionicons name="chatbubble-outline" size={20} color={primaryColor} />
                                </View>
                                <View>
                                    <ThemeTextsecond size={Textstyles.text_xxmedium}>Message Notifications</ThemeTextsecond>
                                    <ThemeText size={Textstyles.text_xxxsmall} style={{ marginTop: 2 }}>
                                        Receive message alerts
                                    </ThemeText>
                                </View>
                            </View>
                            <Switch
                                thumbColor="#ffffff"
                                trackColor={{ false: "#ccc", true: primaryColor }}
                                value={messengerNotification}
                                onValueChange={(value) => handleNotificationToggle('messenger', value)}
                                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                            />
                        </TouchableOpacity>

                        {/* Hire Alert Notification */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                backgroundColor: selectioncardColor,
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 3,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    backgroundColor: primaryColor + '15',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Ionicons name="briefcase-outline" size={20} color={primaryColor} />
                                </View>
                                <View>
                                    <ThemeTextsecond size={Textstyles.text_xxmedium}>Hire Alerts</ThemeTextsecond>
                                    <ThemeText size={Textstyles.text_xxxsmall} style={{ marginTop: 2 }}>
                                        Receive job hire notifications
                                    </ThemeText>
                                </View>
                            </View>
                            <Switch
                                thumbColor="#ffffff"
                                trackColor={{ false: "#ccc", true: primaryColor }}
                                value={hireAlertNotification}
                                onValueChange={(value) => handleNotificationToggle('hireAlert', value)}
                                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ContainerTemplate>
        </>
    )
}

export default NotificationAppearance