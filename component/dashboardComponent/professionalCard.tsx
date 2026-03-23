import { View, Image, Text, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { useTheme } from "../../hooks/useTheme"
import { getColors } from "../../static/color"
import { ThemeTextsecond } from "../ThemeText"
import { Textstyles } from "../../static/textFontsize"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"

interface ProfessionalCardProps {
    profession: string;
    numOfJobs: number;
    numOfProf: number;
}

const ProfessionalCard = ({ profession, numOfJobs, numOfProf }: ProfessionalCardProps) => {
    const { theme } = useTheme()
    const { selectioncardColor, secondaryTextColor, primaryColor, backgroundColortwo } = getColors(theme)
    
    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Staggered entrance animation
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(translateXAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 4,
        }).start();
    };

    // Get sector-specific icon only — colors use primary/secondary theme
    const getSectorIcon = (profession: string): string => {
        const iconMap: { [key: string]: string } = {
            'Home Services': 'home-outline',
            'Technology & IT': 'laptop-outline',
            'Building & Construction': 'business-outline',
            'Automotive Services': 'car-outline',
            'Education & Training': 'school-outline',
            'Health & Wellness': 'heart-outline',
            'Beauty & Personal Care': 'sparkles-outline',
            'Events & Entertainment': 'musical-notes-outline',
            'Business & Professional': 'briefcase-outline',
            'Food & Catering': 'restaurant-outline',
        };
        return iconMap[profession] || 'grid-outline';
    };

    const sectorIcon = getSectorIcon(profession);
    const accentColor = primaryColor;
    const secondaryAccent = backgroundColortwo;

    return (
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
                opacity: opacityAnim,
            }}
        >
            <View
                style={{
                    backgroundColor: selectioncardColor,
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    borderRadius: 20,
                    overflow: 'hidden',
                }}
                className="w-full"
            >
                {/* Gradient Border Effect */}
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: accentColor,
                    }}
                />
                
                <View className="flex-row items-center px-4 py-4">
                    {/* Modern Icon Container */}
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            backgroundColor: accentColor + '15',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: accentColor + '30',
                        }}
                    >
                        <Ionicons
                            name={sectorIcon as any}
                            size={28}
                            color={accentColor}
                        />
                    </View>

                    {/* Content */}
                    <View className="flex-1 ml-4">
                        <Text 
                            style={{ 
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 6,
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue'
                            }}
                        >
                            {profession}
                        </Text>
                        
                        {/* Stats Row */}
                        <View className="flex-row" style={{ gap: 16 }}>
                            <View className="flex-row items-center" style={{ gap: 6 }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        backgroundColor: primaryColor + '15',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FontAwesome5 
                                        color={primaryColor} 
                                        name="briefcase" 
                                        size={9} 
                                    />
                                </View>
                                <Text style={{ 
                                    fontSize: 13, 
                                    color: secondaryTextColor, 
                                    fontFamily: 'TTFirsNeue',
                                    fontWeight: '500'
                                }}>
                                    {numOfJobs} jobs
                                </Text>
                            </View>
                            
                            <View className="flex-row items-center" style={{ gap: 6 }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        backgroundColor: secondaryAccent + '15',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FontAwesome5 
                                        color={secondaryAccent} 
                                        name="users" 
                                        size={9} 
                                    />
                                </View>
                                <Text style={{ 
                                    fontSize: 13, 
                                    color: secondaryTextColor, 
                                    fontFamily: 'TTFirsNeue',
                                    fontWeight: '500'
                                }}>
                                    {numOfProf} pros
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Modern Arrow */}
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: accentColor + '10',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons
                            name="chevron-forward-outline"
                            size={16}
                            color={accentColor}
                        />
                    </View>
                </View>

                {/* Bottom Accent Line */}
                <View
                    style={{
                        height: 2,
                        backgroundColor: accentColor + '20',
                        marginHorizontal: 4,
                        borderRadius: 1,
                    }}
                />
            </View>
        </Animated.View>
    )
}

export default ProfessionalCard