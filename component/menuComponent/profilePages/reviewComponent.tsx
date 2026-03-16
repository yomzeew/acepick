import { useState, useEffect } from "react";
import { Image, ScrollView, View, Dimensions, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import ContainerTemplate from "../../dashboardComponent/containerTemplate";
import BackComponent from "../../backcomponent";
import { getColors } from "../../../static/color";
import { useTheme } from "../../../hooks/useTheme";
import { ThemeText, ThemeTextsecond } from "../../ThemeText";
import { Textstyles } from "../../../static/textFontsize";
import EmptyView from "component/emptyview";
import RatingStar from "component/rating";
import HeaderComponent from "../../headerComp";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { FontAwesome5 } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const ReviewComponent = () => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
    const [refreshing, setRefreshing] = useState(false);
    
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = user?.id;

    // Mock data for reviews - in a real app, this would come from an API
    const reviewsData = [
        {
            id: 1,
            userName: "Akeem Olayemi",
            userAvatar: null, // Would be actual avatar URL
            rating: 5,
            comment: "Excellent service! Very professional and knowledgeable. Fixed my electrical issues quickly and efficiently.",
            date: "2024-02-20",
            serviceType: "Electrical"
        },
        {
            id: 2,
            userName: "Sarah Johnson",
            userAvatar: null,
            rating: 4,
            comment: "Good work overall. Arrived on time and completed the job as expected. Would recommend.",
            date: "2024-02-18",
            serviceType: "Plumbing"
        },
        {
            id: 3,
            userName: "Michael Chen",
            userAvatar: null,
            rating: 5,
            comment: "Outstanding craftsmanship! Attention to detail is impressive. Very satisfied with the results.",
            date: "2024-02-15",
            serviceType: "Carpentry"
        }
    ];

    // Simulate API call
    const { data: reviews, isLoading, error, refetch } = useQuery({
        queryKey: ['reviews', userId],
        queryFn: async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return reviewsData;
        },
        enabled: !!userId,
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderReviewItem = ({ item }: { item: any }) => (
        <ReviewCard review={item} />
    );

    const averageRating = reviews ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;
    const totalReviews = reviews?.length || 0;

    return (
        <ContainerTemplate>
            <HeaderComponent title="Ratings and Reviews" />
            
            {/* Summary Section */}
            <View className="px-4 py-4">
                <View style={{ backgroundColor: selectioncardColor }} className="rounded-2xl p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <ThemeText size={Textstyles.text_xmedium}>{averageRating.toFixed(1)}</ThemeText>
                            <RatingStar numberOfStars={averageRating} size={20} />
                            <ThemeTextsecond size={Textstyles.text_xsmall}>
                                Based on {totalReviews} reviews
                            </ThemeTextsecond>
                        </View>
                        <View className="items-end">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = reviews?.filter(r => Math.floor(r.rating) === stars).length || 0;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <View key={stars} className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-xs w-4">{stars}</Text>
                                        <FontAwesome5 name="star" size={10} color="#facc15" />
                                        <View className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <View 
                                                className="h-full bg-yellow-400" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </View>
                                        <Text className="text-xs w-8 text-right">{count}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* Reviews List */}
            <View className="flex-1 px-4">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={primaryColor} />
                        <ThemeTextsecond size={Textstyles.text_small} className="mt-4">
                            Loading reviews...
                        </ThemeTextsecond>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center">
                        <FontAwesome5 name="exclamation-circle" size={48} color="#ef4444" />
                        <ThemeTextsecond size={Textstyles.text_small} className="mt-4 text-center">
                            Failed to load reviews. Please try again.
                        </ThemeTextsecond>
                        <TouchableOpacity 
                            onPress={onRefresh}
                            style={{ backgroundColor: primaryColor }}
                            className="mt-4 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white text-sm">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : reviews && reviews.length > 0 ? (
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <FontAwesome5 name="star" size={48} color={secondaryTextColor} />
                        <ThemeTextsecond size={Textstyles.text_small} className="mt-4 text-center">
                            No reviews yet. Be the first to leave a review!
                        </ThemeTextsecond>
                    </View>
                )}
            </View>
        </ContainerTemplate>
    );
};

export default ReviewComponent;

export const ReviewCard = ({ review }: { review: any }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <View
            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 mt-3"
        >
            <View className="flex-row items-center gap-x-2">
                <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center">
                    <FontAwesome5 name="user" size={20} color={secondaryTextColor} />
                </View>
                <View className="flex-1">
                    <ThemeText type="primary" size={Textstyles.text_cmedium}>{review.userName}</ThemeText>
                    <ThemeTextsecond size={Textstyles.text_xxxsmall}>{review.serviceType}</ThemeTextsecond>
                </View>
            </View>
            <View className="mt-3">
                <ThemeTextsecond size={Textstyles.text_xsma}>
                    {review.comment}
                </ThemeTextsecond>
            </View>
            <View className="border-b border-slate-200 h-1 mt-3"/>
            <EmptyView height={5} />
            <View className="flex-row justify-between items-center">
                <RatingStar numberOfStars={review.rating} />
                <ThemeTextsecond size={Textstyles.text_xsma}>
                    {formatDate(review.date)}
                </ThemeTextsecond>
            </View>
        </View>
    );
};
