import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import EmptyView from "./emptyview"
import { View, Text, Animated } from "react-native"
import { AntDesign, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { Textstyles } from "static/textFontsize"
import { useEffect, useRef } from "react"

interface ListCardProps{
    content:string
    icon?: string;
    count?: number;
    }

const ListCard = ({content, icon = 'briefcase', count = 0}:ListCardProps) => {
    const { theme } = useTheme()
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme)
    
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
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateXAnim, {
                    toValue: 0,
                    duration: 300,
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

    // Get profession-specific icon only — colors use primary/secondary theme
    const getProfessionIcon = (profession: string): string => {
        const iconMap: { [key: string]: string } = {
            'Plumber': 'water-outline', 'Electrician': 'bolt-outline', 'Carpenter': 'hammer-outline',
            'Painter': 'color-palette-outline', 'HVAC Technician': 'thermometer-outline',
            'Home Cleaner': 'sparkles-outline', 'Pest Control': 'bug-outline', 'Gardener': 'leaf-outline',
            'Web Developer': 'code-outline', 'Mobile App Developer': 'phone-portrait-outline',
            'Graphic Designer': 'brush-outline', 'IT Support Technician': 'desktop-outline',
            'Network Engineer': 'wifi-outline', 'Data Analyst': 'bar-chart-outline',
            'Cybersecurity Expert': 'shield-outline', 'Mason': 'cube-outline', 'Tiler': 'grid-outline',
            'Roofer': 'home-outline', 'Welder': 'flame-outline', 'Architect': 'business-outline',
            'Quantity Surveyor': 'calculator-outline', 'Auto Mechanic': 'car-outline',
            'Auto Electrician': 'flashlight-outline', 'Car Painter': 'color-fill-outline',
            'Tyre Specialist': 'disc-outline', 'Car Wash & Detailing': 'car-sport-outline',
            'Mathematics Tutor': 'calculator-outline', 'English Tutor': 'book-outline',
            'Science Tutor': 'flask-outline', 'Music Teacher': 'musical-notes-outline',
            'Computer Instructor': 'laptop-outline', 'Vocational Trainer': 'school-outline',
            'Fitness Trainer': 'fitness-outline', 'Nutritionist': 'restaurant-outline',
            'Physiotherapist': 'medical-outline', 'Massage Therapist': 'hand-left-outline',
            'Yoga Instructor': 'body-outline', 'Hair Stylist': 'cut-outline',
            'Makeup Artist': 'color-palette-outline', 'Barber': 'cut-outline',
            'Nail Technician': 'sparkles-outline', 'Beautician': 'face-outline',
            'Event Planner': 'calendar-outline', 'Photographer': 'camera-outline',
            'Videographer': 'videocam-outline', 'DJ': 'musical-notes-outline',
            'Caterer': 'restaurant-outline', 'Master of Ceremony': 'mic-outline',
            'Accountant': 'calculator-outline', 'Business Consultant': 'briefcase-outline',
            'Lawyer': 'library-outline', 'Marketing Expert': 'trending-up-outline',
            'HR Consultant': 'people-outline', 'Chef': 'restaurant-outline',
            'Baker': 'cake-outline', 'Catering Service': 'restaurant-outline',
            'Food Vendor': 'storefront-outline',
        };
        return iconMap[profession] || 'briefcase-outline';
    };

    const professionIcon = getProfessionIcon(content);
    const accentColor = primaryColor;
    const secondaryAccent = backgroundColortwo;

    return (
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
                opacity: opacityAnim,
            }}
        >
            <EmptyView height={12} />
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
                
                <View className="flex-row items-center px-5 py-4">
                    {/* Modern Icon Container */}
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            backgroundColor: accentColor + '15',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: accentColor + '30',
                        }}
                    >
                        <Ionicons
                            name={professionIcon as any}
                            size={24}
                            color={accentColor}
                        />
                    </View>

                    {/* Content */}
                    <View className="flex-1 ml-4">
                        <Text 
                            style={{ 
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 4
                            }}
                        >
                            {content}
                        </Text>
                        
                        {count > 0 && (
                            <View className="flex-row items-center" style={{ gap: 6 }}>
                                <View
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        backgroundColor: secondaryAccent + '15',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <FontAwesome5 
                                        color={secondaryAccent} 
                                        name="users" 
                                        size={8} 
                                    />
                                </View>
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: secondaryTextColor, 
                                    fontFamily: 'TTFirsNeue',
                                    opacity: 0.7
                                }}>
                                    {count} professionals available
                                </Text>
                            </View>
                        )}
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
                        marginHorizontal: 5,
                        borderRadius: 1,
                    }}
                />
            </View>
        </Animated.View>
    )
}

export default ListCard