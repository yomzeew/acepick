import React, { useState, useEffect } from "react"
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    Alert,
    Share,
    Linking 
} from "react-native"
import { 
    Ionicons, 
    FontAwesome5, 
    FontAwesome6 
} from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"
import { useQuery } from "@tanstack/react-query"
import { getProfessionDetailFn } from "services/userService"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import RatingStar from "component/rating"
import BackComponent from "component/backcomponent"
import { AlertMessageBanner } from "component/AlertMessageBanner"

interface ProfessionalData {
    id: number;
    available: boolean;
    availableWithdrawalAmount: string;
    avgRating: number;
    chargeFrom: string;
    completedAmount: string;
    createdAt: string;
    file: string | null;
    intro: string;
    language: string;
    numRating: number;
    online: boolean;
    pendingAmount: string;
    profession: {
        id: number;
        image: string;
        sector: any;
        sectorId: number;
        title: string;
    };
    professionId: number;
    profile: {
        avatar: string;
        birthDate: string | null;
        bvn: string | null;
        bvnVerified: boolean;
        certifications: Array<{
            id: number;
            name: string;
            issuer: string;
            date: string;
            credentialId?: string;
        }>;
        count: number;
        createdAt: string;
        education: Array<{
            id: number;
            institution: string;
            degree: string;
            field: string;
            startDate: string;
            endDate?: string;
        }>;
        experience: Array<{
            id: number;
            company: string;
            position: string;
            startDate: string;
            endDate?: string;
            description: string;
        }>;
        fcmToken: string | null;
        firstName: string;
        id: number;
        lastName: string;
        notified: boolean;
        portfolios: Array<{
            id: number;
            title: string;
            description: string;
            images: string[];
            completedAt: string;
        }>;
        position: string | null;
        rate: string;
        store: boolean;
        switch: boolean;
        totalDisputes: number;
        totalExpense: number;
        totalJobs: number;
        totalJobsApproved: number;
        totalJobsCanceled: number;
        totalJobsCompleted: number;
        totalJobsDeclined: number;
        totalJobsOngoing: number;
        totalJobsPending: number;
        totalReview: number;
        updatedAt: string;
        user: {
            id: string;
            email: string;
            phone: string;
            status: string;
            role: string;
            createdAt: string;
            updatedAt: string;
            location: {
                id: number;
                address: string;
                lga: string;
                state: string;
                latitude: number;
                longitude: number;
                zipcode: string;
            };
            professionalReviews?: Array<{
                id: number;
                text: string;
                professionalUserId: string;
                clientUserId: string;
                createdAt: string;
                updatedAt: string;
                clientUser: {
                    id: string;
                    email: string;
                    phone: string;
                    status: string;
                    role: string;
                    profile: {
                        id: number;
                        firstName: string;
                        lastName: string;
                        birthDate: string;
                        avatar?: string;
                    };
                };
            }>;
        };
        userId: string;
        verified: boolean;
    };
    profileId: number;
    regNum: string | null;
    rejectedAmount: string;
    totalEarning: number;
    updatedAt: string;
    workType: string;
    yearsOfExp: number;
}

const ProfessionalProfile = () => {
    // Safe theme access with fallback
    let theme: "light" | "dark" = "light";
    let primaryColor = "#59C5E0";
    let secondaryTextColor = "#171717";
    let backgroundColor = "#ffffff";
    let selectioncardColor = "#f3f4f6";
    let backgroundColortwo = "#33658A";
    
    try {
        const themeContext = useTheme();
        theme = themeContext.theme;
        const colors = getColors(theme);
        primaryColor = colors.primaryColor;
        secondaryTextColor = colors.secondaryTextColor;
        backgroundColor = colors.backgroundColor;
        selectioncardColor = colors.selectioncardColor;
        backgroundColortwo = colors.backgroundColortwo;
    } catch (error) {
        console.warn('Theme context not available, using default theme');
        primaryColor = "#59C5E0";
        secondaryTextColor = "#171717";
        backgroundColor = "#ffffff";
        selectioncardColor = "#f3f4f6";
        backgroundColortwo = "#33658A";
    }
    
    // Safe router access with fallback
    let router: any = null;
    let params: any = {};
    
    try {
        router = useRouter();
        params = useLocalSearchParams();
    } catch (error) {
        console.warn('Router context not available, using default values');
        router = null;
        params = {};
    }
    
    // Support both route patterns: [professionalId] and professional/[id]
    const professionalId = Number(params.professionalId || params.id);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'portfolio' | 'reviews'>('overview');

    // Query for professional data
    const { data: professionalData, isLoading, error, refetch } = useQuery<ProfessionalData>({
        queryKey: ['professionalDetail', professionalId],
        queryFn: () => getProfessionDetailFn(professionalId),
        enabled: !!professionalId && !isNaN(professionalId),
        retry: 2,
    });

    // Debug logging
    useEffect(() => {
        if (professionalData) {
            const reviews = professionalData?.profile?.user?.professionalReviews || [];
            console.log('🔍 Professional data loaded:', {
                id: professionalData?.id,
                hasProfile: !!professionalData?.profile,
                hasProfession: !!professionalData?.profession,
                professionTitle: professionalData?.profession?.title,
                profileKeys: professionalData?.profile ? Object.keys(professionalData.profile) : [],
                professionKeys: professionalData?.profession ? Object.keys(professionalData.profession) : [],
                profileFirstName: professionalData?.profile?.firstName,
                profileLastName: professionalData?.profile?.lastName,
                userEmail: professionalData?.profile?.user?.email,
                userPhone: professionalData?.profile?.user?.phone,
                userLocation: professionalData?.profile?.user?.location,
                professionalReviews: reviews.length || 0,
                avgRating: professionalData?.avgRating,
                numRating: professionalData?.numRating,
                available: professionalData?.available,
                // Check specific fields that should be displayed
                displayName: `${professionalData?.profile?.firstName || 'Professional'} ${professionalData?.profile?.lastName || 'Name'}`,
                displayProfession: professionalData?.profession?.title || 'Professional',
                displayLocation: `${professionalData?.profile?.user?.location?.lga || 'Location'}, ${professionalData?.profile?.user?.location?.state || 'State'}`,
                displayRating: (professionalData?.avgRating || 0).toFixed(1),
                displayReviews: professionalData?.numRating || 0,
                displayAvailable: professionalData?.available ? 'Available' : 'Busy',
                // Detailed review debugging
                reviewsDetails: reviews.map(r => ({
                    id: r.id,
                    text: r.text?.substring(0, 50) + '...',
                    clientName: `${r.clientUser?.profile?.firstName || ''} ${r.clientUser?.profile?.lastName || ''}`,
                    createdAt: r.createdAt
                })),
                hasUserObject: !!professionalData?.profile?.user,
                userKeys: professionalData?.profile?.user ? Object.keys(professionalData.profile.user) : []
            });
        } else {
            console.log('❌ No professional data available');
        }
    }, [professionalData]);

    useEffect(() => {
        if (error) {
            console.error('❌ Professional data error:', error);
            console.error('❌ Error details:', {
                message: error.message,
                status: (error as any)?.response?.status,
                statusText: (error as any)?.response?.statusText,
                data: (error as any)?.response?.data,
            });
        }
    }, [error]);

    const handleContactProfessional = () => {
        if (!professionalData) return;
        
        console.log('Professional Data:', professionalData);
        console.log('Professional ID:', professionalData?.id, 'type:', typeof professionalData?.id);
        console.log('User ID:', professionalData?.profile?.user?.id, 'type:', typeof professionalData?.profile?.user?.id);
        
        const fullName = `${professionalData?.profile?.firstName || 'Professional'} ${professionalData?.profile?.lastName || 'Name'}`;
        const rating = professionalData?.avgRating || 0;
        const avatar = professionalData?.profile?.avatar || '';
        
        // Use the User ID (UUID) instead of Professional ID (number)
        const userId = professionalData?.profile?.user?.id;
        if (!userId) {
            console.error('User ID not found in professional data');
            Alert.alert('Error', 'Unable to create job request. User information not found.');
            return;
        }
        
        router.push(`/joborderLayout?professionalId=${userId}&avatar=${encodeURIComponent(avatar)}&fullName=${encodeURIComponent(fullName)}&rating=${rating}`);
    };

    const handleShareProfile = async () => {
        if (!professionalData) return;
        
        const fullName = `${professionalData?.profile?.firstName || 'Professional'} ${professionalData?.profile?.lastName || 'Name'}`;
        const message = `Check out ${fullName}, a ${professionalData?.profession?.title || 'Professional'} with ${(professionalData?.avgRating || 0).toFixed(1)} stars rating!`;
        
        try {
            await Share.share({
                message,
                title: `${fullName}'s Profile`,
            });
        } catch (error) {
            console.error('Error sharing profile:', error);
        }
    };

    const handleCallProfessional = () => {
        if (!professionalData?.profile?.user?.phone) return;
        
        Alert.alert(
            'Call Professional',
            `Would you like to call ${professionalData?.profile?.firstName || 'Professional'} at ${professionalData.profile.user.phone}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Call', 
                    onPress: () => Linking.openURL(`tel:${professionalData.profile.user.phone}`)
                }
            ]
        );
    };

    const handleEmailProfessional = () => {
        if (!professionalData?.profile?.user?.email) return;
        
        Linking.openURL(`mailto:${professionalData.profile.user.email}`);
    };

    const isInvalidId = !professionalId || isNaN(professionalId);

    // Auto-navigate back if professional ID is invalid
    useEffect(() => {
        if (isInvalidId && router) {
            const timer = setTimeout(() => {
                router.canGoBack() ? router.back() : router.replace('/(Authenticated)/(dashboard)/homelayout');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isInvalidId]);

    if (isInvalidId) {
        return (
            <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor }}>
                <Ionicons name="person-outline" size={64} color={secondaryTextColor} />
                <Text style={{ 
                    fontSize: 18, 
                    color: secondaryTextColor, 
                    fontFamily: 'TTFirsNeue',
                    textAlign: 'center',
                    marginTop: 16 
                }}>
                    Professional Profile Unavailable
                </Text>
                <Text style={{ 
                    fontSize: 14, 
                    color: secondaryTextColor + '80', 
                    fontFamily: 'TTFirsNeue',
                    textAlign: 'center',
                    marginTop: 8 
                }}>
                    Redirecting you back...
                </Text>
                <TouchableOpacity
                    onPress={() => router?.canGoBack() ? router.back() : router?.replace('/(Authenticated)/(dashboard)/homelayout')}
                    style={{ marginTop: 20, backgroundColor: primaryColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                >
                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'TTFirsNeueMedium' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ 
                    fontSize: 16, 
                    color: secondaryTextColor, 
                    fontFamily: 'TTFirsNeue',
                    marginTop: 16 
                }}>
                    Loading professional profile...
                </Text>
            </View>
        );
    }

    if (error || !professionalData) {
        return (
            <ScrollView className="flex-1" style={{ backgroundColor }}>
                <View className="flex-1 justify-center items-center px-4 py-8">
                    <Ionicons name="alert-circle-outline" size={64} color={backgroundColortwo} />
                    <Text style={{
                        fontSize: 18,
                        color: backgroundColortwo,
                        fontFamily: 'TTFirsNeue',
                        textAlign: 'center',
                        marginTop: 16
                    }}>
                        Error Loading Profile
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: secondaryTextColor,
                        fontFamily: 'TTFirsNeue',
                        textAlign: 'center',
                        marginTop: 8
                    }}>
                        {error instanceof Error ? error.message : 'Unable to load professional data'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{
                            backgroundColor: primaryColor,
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 8,
                            marginTop: 20
                        }}
                    >
                        <Text style={{
                            color: '#ffffff',
                            fontFamily: 'TTFirsNeue',
                            fontWeight: '600'
                        }}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* Debug Panel */}
                <View className="px-4 py-4">
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                        fontFamily: 'TTFirsNeue',
                        marginBottom: 12
                    }}>
                        Debug Information
                    </Text>
                    <View style={{
                        backgroundColor: '#f3f4f6',
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 12
                    }}>
                        <Text style={{
                            fontSize: 12,
                            color: secondaryTextColor,
                            fontFamily: 'monospace',
                            marginBottom: 8
                        }}>
                            Professional ID: {professionalId}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            color: secondaryTextColor,
                            fontFamily: 'monospace',
                            marginBottom: 8
                        }}>
                            Has Error: {!!error}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            color: secondaryTextColor,
                            fontFamily: 'monospace',
                            marginBottom: 8
                        }}>
                            Has Data: {!!professionalData}
                        </Text>
                        {error && (
                            <Text style={{
                                fontSize: 12,
                                color: backgroundColortwo,
                                fontFamily: 'monospace',
                                marginBottom: 8
                            }}>
                                Error: {error instanceof Error ? error.message : 'Unknown error'}
                            </Text>
                        )}
                    </View>
                    
                    <TouchableOpacity
                        onPress={() => {
                            console.log('🔍 Manual data check:', {
                                professionalId,
                                error,
                                professionalData,
                                errorDetails: error instanceof Error ? {
                                    message: error.message,
                                    stack: error.stack
                                } : error
                            });
                        }}
                        style={{
                            backgroundColor: primaryColor,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 12,
                            fontFamily: 'TTFirsNeue',
                            fontWeight: '600'
                        }}>
                            Log Debug Info to Console
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <View style={{ backgroundColor }} className="flex-1">
            {/* Error Banner */}
            {errorMessage && (
                <AlertMessageBanner type="error" message={errorMessage} />
            )}

            {/* Header */}
            <View style={{ backgroundColor: primaryColor }} className="pt-12 pb-6">
                <View className="px-4">
                    <BackComponent bordercolor="#ffffff" textcolor="#ffffff" />
                </View>
                
                {/* Profile Header */}
                <View className="px-4 mt-4">
                    <View className="items-center">
                        {/* Avatar */}
                        <View className="relative">
                            <Image
                                source={
                                    professionalData?.profile?.avatar && professionalData.profile.avatar.startsWith('http')
                                        ? { uri: professionalData.profile.avatar }
                                        : require('../../../assets/professional.png')
                                }
                                className="w-24 h-24 rounded-full"
                                style={{
                                    borderWidth: 3,
                                    borderColor: '#ffffff' + '30',
                                    backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6'
                                }}
                            />
                            {professionalData?.profile?.verified && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: -2,
                                        right: -2,
                                        width: 24,
                                        height: 24,
                                        backgroundColor: primaryColor,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 2,
                                        borderColor: '#ffffff'
                                    }}
                                >
                                    <FontAwesome5 name="check" size={12} color="#ffffff" />
                                </View>
                            )}
                        </View>

                        {/* Name and Title */}
                        <View className="items-center mt-4">
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#ffffff',
                                fontFamily: 'TTFirsNeue',
                                textAlign: 'center'
                            }}>
                                {professionalData?.profile?.firstName || 'Professional'} {professionalData?.profile?.lastName || 'Name'}
                            </Text>
                            
                            <View className="flex-row items-center mt-2">
                                <FontAwesome5 name="toolbox" size={14} color="#ffffff" />
                                <Text style={{
                                    fontSize: 14,
                                    color: '#ffffff',
                                    fontFamily: 'TTFirsNeue',
                                    marginLeft: 6
                                }}>
                                    {professionalData?.profession?.title || 'Professional'}
                                </Text>
                                {professionalData?.yearsOfExp && (
                                    <Text style={{
                                        fontSize: 14,
                                        color: '#ffffff' + '80',
                                        fontFamily: 'TTFirsNeue',
                                        marginLeft: 8
                                    }}>
                                        • {professionalData.yearsOfExp} years
                                    </Text>
                                )}
                            </View>

                            {/* Location */}
                            <View className="flex-row items-center mt-2">
                                <FontAwesome6 name="location-dot" size={12} color="#ffffff" />
                                <Text style={{
                                    fontSize: 13,
                                    color: '#ffffff' + '90',
                                    fontFamily: 'TTFirsNeue',
                                    marginLeft: 4
                                }}>
                                    {professionalData?.profile?.user?.location?.lga || 'Location'}, {professionalData?.profile?.user?.location?.state || 'State'}
                                </Text>
                            </View>

                            {/* Rating */}
                            <View className="flex-row items-center mt-3">
                                <RatingStar numberOfStars={Math.round(professionalData?.avgRating || 0)} />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    fontFamily: 'TTFirsNeue',
                                    marginLeft: 8
                                }}>
                                    {(professionalData?.avgRating || 0).toFixed(1)}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: '#ffffff' + '70',
                                    fontFamily: 'TTFirsNeue',
                                    marginLeft: 4
                                }}>
                                    ({professionalData?.numRating || 0} reviews)
                                </Text>
                            </View>

                            {/* Status */}
                            <View
                                style={{
                                    backgroundColor: professionalData?.available ? primaryColor : backgroundColortwo,
                                    paddingHorizontal: 16,
                                    paddingVertical: 6,
                                    borderRadius: 20,
                                    marginTop: 12
                                }}
                            >
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    fontFamily: 'TTFirsNeue'
                                }}>
                                    {professionalData?.available ? 'Available' : 'Busy'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="px-4 py-4" style={{ backgroundColor: selectioncardColor }}>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={handleContactProfessional}
                        style={{
                            flex: 1,
                            backgroundColor: primaryColor,
                            paddingVertical: 12,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: '600',
                            fontFamily: 'TTFirsNeue'
                        }}>
                            Send Job Request
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleShareProfile}
                        style={{
                            backgroundColor: selectioncardColor,
                            borderWidth: 1,
                            borderColor: primaryColor,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesome5 name="share-alt" size={16} color={primaryColor} />
                    </TouchableOpacity>
                </View>

                {/* Contact Options */}
                <View className="flex-row gap-3 mt-3">
                    {professionalData?.profile?.user?.phone && (
                        <TouchableOpacity
                            onPress={handleCallProfessional}
                            style={{
                                flex: 1,
                                backgroundColor: selectioncardColor,
                                borderWidth: 1,
                                borderColor: secondaryTextColor + '30',
                                paddingVertical: 10,
                                borderRadius: 12,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}
                        >
                            <Ionicons name="call-outline" size={16} color={primaryColor} />
                            <Text style={{
                                color: primaryColor,
                                fontSize: 12,
                                fontWeight: '600',
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 6
                            }}>
                                Call
                            </Text>
                        </TouchableOpacity>
                    )}

                    {professionalData?.profile?.user?.email && (
                        <TouchableOpacity
                            onPress={handleEmailProfessional}
                            style={{
                                flex: 1,
                                backgroundColor: selectioncardColor,
                                borderWidth: 1,
                                borderColor: secondaryTextColor + '30',
                                paddingVertical: 10,
                                borderRadius: 12,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}
                        >
                            <Ionicons name="mail-outline" size={16} color={primaryColor} />
                            <Text style={{
                                color: primaryColor,
                                fontSize: 12,
                                fontWeight: '600',
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 6
                            }}>
                                Email
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tabs */}
            <View className="px-4 py-2" style={{ backgroundColor: selectioncardColor }}>
                <View className="flex-row bg-gray-100 rounded-xl p-1">
                    {[
                        { key: 'overview', label: 'Overview', icon: 'person' },
                        { key: 'experience', label: 'Experience', icon: 'briefcase' },
                        { key: 'portfolio', label: 'Portfolio', icon: 'images' },
                        { key: 'reviews', label: 'Reviews', icon: 'star' }
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as any)}
                            style={{
                                flex: 1,
                                backgroundColor: activeTab === tab.key ? primaryColor : 'transparent',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center'
                            }}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={activeTab === tab.key ? '#ffffff' : secondaryTextColor}
                            />
                            <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: activeTab === tab.key ? '#ffffff' : secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginTop: 2
                            }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tab Content */}
            <ScrollView className="flex-1 px-4 py-4">
                {professionalData && (
                <ProfessionalDetailsTab 
                    data={professionalData} 
                    activeTab={activeTab} 
                    theme={theme}
                    colors={{ primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo }}
                />
            )}
            </ScrollView>
        </View>
    );
};

interface ProfessionalDetailsTabProps {
    data: ProfessionalData;
    activeTab: 'overview' | 'experience' | 'portfolio' | 'reviews';
    theme: string;
    colors: {
        primaryColor: string;
        secondaryTextColor: string;
        selectioncardColor: string;
        backgroundColortwo: string;
    };
}

const ProfessionalDetailsTab = ({ data, activeTab, theme, colors }: ProfessionalDetailsTabProps) => {
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = colors;

    // Add null check for data
    if (!data) {
        return (
            <View className="flex-1 justify-center items-center py-8">
                <Ionicons name="alert-circle-outline" size={48} color={secondaryTextColor} />
                <Text style={{
                    fontSize: 14,
                    color: secondaryTextColor,
                    fontFamily: 'TTFirsNeue',
                    marginTop: 12,
                    textAlign: 'center'
                }}>
                    Professional data not available
                </Text>
            </View>
        );
    }

    if (activeTab === 'overview') {
        return (
            <View>
                {/* About */}
                <View className="mb-6">
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                        fontFamily: 'TTFirsNeue',
                        marginBottom: 12
                    }}>
                        About
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: secondaryTextColor,
                        fontFamily: 'TTFirsNeue',
                        lineHeight: 20
                    }}>
                        {data.intro || 'No bio available yet.'}
                    </Text>
                </View>

                {/* Skills */}
                <View className="mb-6">
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                        fontFamily: 'TTFirsNeue',
                        marginBottom: 12
                    }}>
                        Professional Details
                    </Text>
                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <FontAwesome5 name="toolbox" size={14} color={primaryColor} />
                            <Text style={{
                                fontSize: 14,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 12
                            }}>
                                {data?.profession?.title || 'Professional'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome6 name="location-dot" size={14} color={primaryColor} />
                            <Text style={{
                                fontSize: 14,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 12
                            }}>
                                {data?.profile?.user?.location?.lga || 'Location'}, {data?.profile?.user?.location?.state || 'State'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle-outline" size={14} color={primaryColor} />
                            <Text style={{
                                fontSize: 14,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginLeft: 12
                            }}>
                                {data?.numRating || 0} reviews received
                            </Text>
                        </View>
                        {data.chargeFrom && (
                            <View className="flex-row items-center">
                                <FontAwesome5 name="naira-sign" size={14} color={primaryColor} />
                                <Text style={{
                                    fontSize: 14,
                                    color: secondaryTextColor,
                                    fontFamily: 'TTFirsNeue',
                                    marginLeft: 12
                                }}>
                                    Starts from {data.chargeFrom}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Stats */}
                <View className="mb-6">
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                        fontFamily: 'TTFirsNeue',
                        marginBottom: 12
                    }}>
                        Performance
                    </Text>
                    <View className="flex-row gap-4">
                        <View style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            flex: 1,
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: primaryColor,
                                fontFamily: 'TTFirsNeue'
                            }}>
                                {(data.avgRating || 0).toFixed(1)}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginTop: 4
                            }}>
                                Rating
                            </Text>
                        </View>
                        <View style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            flex: 1,
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: primaryColor,
                                fontFamily: 'TTFirsNeue'
                            }}>
                                {data.numRating || 0}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginTop: 4
                            }}>
                                Reviews
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    if (activeTab === 'experience') {
        return (
            <View>
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    fontFamily: 'TTFirsNeue',
                    marginBottom: 16
                }}>
                    Work Experience
                </Text>
                {data.profile?.experience && data.profile.experience.length > 0 ? (
                    data.profile.experience?.map((exp) => (
                        <View key={exp.id} style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 4
                            }}>
                                {exp.position}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: primaryColor,
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 8
                            }}>
                                {exp.company}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 8
                            }}>
                                {exp.startDate} - {exp.endDate || 'Present'}
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                lineHeight: 18
                            }}>
                                {exp.description}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="items-center py-8">
                        <Ionicons name="briefcase-outline" size={48} color={secondaryTextColor} />
                        <Text style={{
                            fontSize: 14,
                            color: secondaryTextColor,
                            fontFamily: 'TTFirsNeue',
                            marginTop: 12
                        }}>
                            No work experience added yet
                        </Text>
                    </View>
                )}

                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    fontFamily: 'TTFirsNeue',
                    marginBottom: 16,
                    marginTop: 24
                }}>
                    Education
                </Text>
                {data.profile?.education && data.profile.education.length > 0 ? (
                    data.profile.education?.map((edu) => (
                        <View key={edu.id} style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 4
                            }}>
                                {edu.degree} in {edu.field}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: primaryColor,
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 8
                            }}>
                                {edu.institution}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue'
                            }}>
                                {edu.startDate} - {edu.endDate || 'Present'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="items-center py-8">
                        <Ionicons name="school-outline" size={48} color={secondaryTextColor} />
                        <Text style={{
                            fontSize: 14,
                            color: secondaryTextColor,
                            fontFamily: 'TTFirsNeue',
                            marginTop: 12
                        }}>
                            No education added yet
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    if (activeTab === 'portfolio') {
        return (
            <View>
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    fontFamily: 'TTFirsNeue',
                    marginBottom: 16
                }}>
                    Portfolio
                </Text>
                {data.profile?.portfolios && data.profile.portfolios.length > 0 ? (
                    data.profile.portfolios?.map((item) => (
                        <View key={item.id} style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                fontFamily: 'TTFirsNeue',
                                marginBottom: 8
                            }}>
                                {item.title}
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                lineHeight: 18,
                                marginBottom: 8
                            }}>
                                {item.description}
                            </Text>
                            <Text style={{
                                fontSize: 11,
                                color: secondaryTextColor + '60',
                                fontFamily: 'TTFirsNeue'
                            }}>
                                Completed: {new Date(item.completedAt).toLocaleDateString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="items-center py-8">
                        <Ionicons name="images-outline" size={48} color={secondaryTextColor} />
                        <Text style={{
                            fontSize: 14,
                            color: secondaryTextColor,
                            fontFamily: 'TTFirsNeue',
                            marginTop: 12
                        }}>
                            No portfolio items added yet
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    if (activeTab === 'reviews') {
        return (
            <View>
                <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                    fontFamily: 'TTFirsNeue',
                    marginBottom: 16
                }}>
                    Reviews
                </Text>
                {data.profile?.user?.professionalReviews && data.profile.user.professionalReviews.length > 0 ? (
                    data.profile.user.professionalReviews?.map((review) => (
                        <View key={review.id} style={{
                            backgroundColor: selectioncardColor,
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12
                        }}>
                            <View className="flex-row items-start mb-3">
                                <Image
                                    source={{
                                        uri: review.clientUser.profile.avatar || 'https://placehold.co/40x40?text=Avatar'
                                    }}
                                    className="w-10 h-10 rounded-full"
                                    style={{ marginRight: 12 }}
                                />
                                <View className="flex-1">
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: theme === 'dark' ? '#FFFFFF' : '#1F2937',
                                        fontFamily: 'TTFirsNeue'
                                    }}>
                                        {review.clientUser.profile.firstName} {review.clientUser.profile.lastName}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <RatingStar numberOfStars={5} />
                                        <Text style={{
                                            fontSize: 11,
                                            color: secondaryTextColor,
                                            fontFamily: 'TTFirsNeue',
                                            marginLeft: 6
                                        }}>
                                            5.0
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{
                                fontSize: 13,
                                color: secondaryTextColor,
                                fontFamily: 'TTFirsNeue',
                                lineHeight: 18
                            }}>
                                {review.text}
                            </Text>
                            <Text style={{
                                fontSize: 11,
                                color: secondaryTextColor + '60',
                                fontFamily: 'TTFirsNeue',
                                marginTop: 8
                            }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="items-center py-8">
                        <Ionicons name="star-outline" size={48} color={secondaryTextColor} />
                        <Text style={{
                            fontSize: 14,
                            color: secondaryTextColor,
                            fontFamily: 'TTFirsNeue',
                            marginTop: 12
                        }}>
                            No reviews yet
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            color: secondaryTextColor + '70',
                            fontFamily: 'TTFirsNeue',
                            marginTop: 4,
                            textAlign: 'center'
                        }}>
                            Be the first to review {data.profile?.firstName || 'this professional'}!
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    return null;
};

export default ProfessionalProfile;
