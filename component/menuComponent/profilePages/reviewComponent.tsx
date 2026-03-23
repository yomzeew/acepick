import { useState } from "react";
import { Image, View, Dimensions, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import ContainerTemplate from "../../dashboardComponent/containerTemplate";
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
import { FontAwesome5 } from "@expo/vector-icons";
import { getMyReviewsFn } from "services/userService";

const { height } = Dimensions.get("window");

interface ReviewData {
    id: string;
    text: string;
    rating: number | null;
    createdAt: string;
    jobTitle: string | null;
    jobId: number | null;
    orderId: number | null;
    reviewer: {
        firstName: string;
        lastName: string;
        avatar: string | null;
    } | null;
}

const ReviewComponent = () => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
    const [refreshing, setRefreshing] = useState(false);
    
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = user?.id;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['reviews', 'my'],
        queryFn: getMyReviewsFn,
        enabled: !!userId,
    });

    const reviews: ReviewData[] = data?.data?.reviews ?? [];
    const averageRating: number = data?.data?.averageRating ?? 0;
    const totalReviews: number = data?.data?.total ?? 0;

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderReviewItem = ({ item }: { item: ReviewData }) => (
        <ReviewCard review={item} />
    );

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
                                const count = reviews?.filter(r => r.rating !== null && Math.floor(r.rating) === stars).length || 0;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <View key={stars} className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-xs w-4">{stars}</Text>
                                        <FontAwesome5 name="star" size={10} color={backgroundColortwo} />
                                        <View className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <View 
                                                style={{ width: `${percentage}%`, backgroundColor: backgroundColortwo }}
                                                className="h-full rounded-full"
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
                        <FontAwesome5 name="exclamation-circle" size={48} color={backgroundColortwo} />
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
                            No reviews yet.
                        </ThemeTextsecond>
                    </View>
                )}
            </View>
        </ContainerTemplate>
    );
};

export default ReviewComponent;

export const ReviewCard = ({ review }: { review: ReviewData }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const reviewerName = review.reviewer
        ? `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim()
        : 'Anonymous';

    return (
        <View
            style={{ backgroundColor: selectioncardColor, elevation: 4 }}
            className="w-full h-auto rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 mt-3"
        >
            <View className="flex-row items-center gap-x-2">
                {review.reviewer?.avatar ? (
                    <Image
                        source={{ uri: review.reviewer.avatar }}
                        className="w-12 h-12 rounded-full"
                    />
                ) : (
                    <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center">
                        <FontAwesome5 name="user" size={20} color={secondaryTextColor} />
                    </View>
                )}
                <View className="flex-1">
                    <ThemeText type="primary" size={Textstyles.text_cmedium}>{reviewerName}</ThemeText>
                    {review.jobTitle && (
                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>{review.jobTitle}</ThemeTextsecond>
                    )}
                    {review.orderId && !review.jobTitle && (
                        <ThemeTextsecond size={Textstyles.text_xxxsmall}>Delivery Order</ThemeTextsecond>
                    )}
                </View>
            </View>
            <View className="mt-3">
                <ThemeTextsecond size={Textstyles.text_xsma}>
                    {review.text}
                </ThemeTextsecond>
            </View>
            <View className="border-b border-slate-200 h-1 mt-3"/>
            <EmptyView height={5} />
            <View className="flex-row justify-between items-center">
                {review.rating !== null ? (
                    <RatingStar numberOfStars={review.rating} />
                ) : (
                    <View />
                )}
                <ThemeTextsecond size={Textstyles.text_xsma}>
                    {formatDate(review.createdAt)}
                </ThemeTextsecond>
            </View>
        </View>
    );
};
