import { View, Image, TouchableOpacity } from "react-native"
import { useState, useCallback, useMemo, memo } from "react"
import NotificationIcon from "../icons/notificationIcon"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { ThemeText } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { Feather } from "@expo/vector-icons"
import { getColors } from "static/color"
import { useTheme } from "hooks/useTheme"
import { useRouter } from "expo-router"
import { getInitials } from "../../utilizes/initialsName"

interface HeaderComponentProps {
  showGreeting?: boolean;
  showSettings?: boolean;
}

const HeaderComponent: React.FC<HeaderComponentProps> = memo(({ 
  showGreeting = true, 
  showSettings = true 
}) => {
  const { theme } = useTheme()
  const { primaryColor } = getColors(theme)
  const user = useSelector((state: RootState) => state?.auth?.user);
  const role = user?.role
  const [avatarError, setAvatarError] = useState(false)

  const navRoute = useMemo(() => 
    role === 'professional' ? '/profileprofessionlayout' : '/profilelayout', 
    [role]
  );

  const router = useRouter()
    
    const auth = useSelector((state: RootState) => state.auth?.isAuthenticated);
  const clientName: string = user?.profile.firstName || ' '
  const avatar: string = user?.profile.avatar || ' '
  
  const userInitials = useMemo(() => 
    getInitials(user?.profile), 
    [user?.profile]
  );

  const getGreeting = useCallback(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
  }, []);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
  }, []);

  const handleSettingsPress = useCallback(() => {
    router.push(navRoute);
  }, [router, navRoute]);

  const handleNotificationPress = useCallback(() => {
    router.push('/notificationLayout');
  }, [router]);

  const greeting = useMemo(() => getGreeting(), [getGreeting]);

  return (
        <View className="h-32 pt-10 w-full flex-row justify-between items-center">
            <View className="flex-row gap-2 items-center">
        {!avatarError ? (
          <Image 
            className="w-16 h-16 rounded-full" 
            resizeMode="contain" 
            source={{ uri: avatar }} 
            onError={handleAvatarError}
            accessible={true}
            accessibilityLabel="User profile avatar"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-300 justify-center items-center">
            <ThemeText size={Textstyles.text_medium} className="text-gray-600 font-bold">
              {userInitials}
            </ThemeText>
          </View>
        )}
            <View>
          {showGreeting && (
            <ThemeText type="secondary" size={Textstyles.text_xsma}>
              {greeting}
            </ThemeText>
          )}
          <ThemeText type="secondary" size={Textstyles.text_xmedium}>
            {clientName}
          </ThemeText>
                </View>
            </View>
            <View className="flex-row gap-2 items-center">
        {showSettings && (
          <TouchableOpacity 
            onPress={handleSettingsPress}
            accessible={true}
            accessibilityLabel="Settings button"
            accessibilityHint="Opens settings menu"
          >
            <Feather size={24} color={primaryColor} name="settings" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={handleNotificationPress}
          accessible={true}
          accessibilityLabel="Notifications"
          accessibilityHint="Opens notifications"
        >
          <NotificationIcon />
        </TouchableOpacity>
            </View>
        </View>
    )
});

HeaderComponent.displayName = 'HeaderComponent';

export default HeaderComponent