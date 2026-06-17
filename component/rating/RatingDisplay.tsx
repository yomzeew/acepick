import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { getRatingStats, getProfessionalReviews, RatingStats, Review } from 'services/ratingService';
import RatingModal from './RatingModal';
import RatingStar from 'component/rating';

interface RatingDisplayProps {
  professionalId: string;
  professionalName: string;
  showAddRating?: boolean;
  jobId?: string;
  orderId?: string;
  onRatingSubmitted?: () => void;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  professionalId,
  professionalName,
  showAddRating = false,
  jobId,
  orderId,
  onRatingSubmitted,
}) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, successColor, errorColor } = getColors(theme);
  
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRatingData = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      
      // Fetch rating stats
      const statsResponse = await getRatingStats(professionalId);
      setRatingStats(statsResponse);
      
      // Fetch reviews
      const reviewsResponse = await getProfessionalReviews(professionalId, page, 10);
      
      if (page === 1 || refresh) {
        setReviews(reviewsResponse.reviews);
      } else {
        setReviews(prev => [...prev, ...reviewsResponse.reviews]);
      }
      
      setHasMore(page < reviewsResponse.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch rating data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRatingData(1, true);
  }, [professionalId]);

  const handleRefresh = () => {
    fetchRatingData(1, true);
  };

  const loadMoreReviews = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRatingData(nextPage, false);
    }
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    onRatingSubmitted?.();
    handleRefresh();
  };

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View key={rating} className="flex-row items-center mb-2">
        <View className="flex-row items-center w-16">
          <Text style={{ fontSize: 12, color: secondaryTextColor, marginRight: 4 }}>
            {rating}
          </Text>
          <AntDesign name="star" size={12} color="#F59E0B" />
        </View>
        <View className="flex-1 mx-3">
          <View
            style={{
              height: 6,
              backgroundColor: '#E5E7EB',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${percentage}%`,
                backgroundColor: '#F59E0B',
                borderRadius: 3,
              }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 12, color: secondaryTextColor, minWidth: 30, textAlign: 'right' }}>
          {count}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ color: secondaryTextColor, marginTop: 8 }}>Loading ratings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Rating Summary */}
      {ratingStats && (
        <View
          style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
          className="rounded-2xl p-4 mb-4"
        >
          <View className="flex-row items-center mb-4">
            <View className="items-center mr-6">
              <Text style={{ fontSize: 32, fontWeight: '800', color: secondaryTextColor }}>
                {Number(ratingStats.averageRating ?? 0).toFixed(1)}
              </Text>
              <View className="flex-row items-center mt-1">
                <RatingStar numberOfStars={Number(ratingStats.averageRating ?? 0)} size={16} />
                <Text style={{ fontSize: 12, color: secondaryTextColor, opacity: 0.7, marginLeft: 4 }}>
                  ({ratingStats.totalRatings ?? 0})
                </Text>
              </View>
            </View>
            
            <View className="flex-1">
              {Object.entries(ratingStats.ratingDistribution)
                .reverse()
                .map(([rating, count]) => renderRatingBar(parseInt(rating), count, ratingStats.totalRatings ?? 0))}
            </View>
          </View>
        </View>
      )}

      {/* Add Rating Button */}
      {showAddRating && (
        <TouchableOpacity
          onPress={() => setShowRatingModal(true)}
          style={{
            backgroundColor: primaryColor,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 20,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AntDesign name="star" size={20} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
            Rate {professionalName}
          </Text>
        </TouchableOpacity>
      )}

      {/* Reviews */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: secondaryTextColor, marginBottom: 16 }}>
          Reviews ({reviews.length})
        </Text>
        
        {reviews.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View
              style={{ backgroundColor: primaryColor + '10' }}
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
            >
              <AntDesign name="staro" size={32} color={primaryColor} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: secondaryTextColor }}>
              No reviews yet
            </Text>
            <Text style={{ fontSize: 14, color: secondaryTextColor, opacity: 0.7, marginTop: 4 }}>
              Be the first to rate {professionalName}
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View
              key={review.id}
              style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1 }}
              className="rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-start mb-3">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: primaryColor + '10',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: primaryColor }}>
                    {review.clientName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ fontSize: 14, fontWeight: '700', color: secondaryTextColor }}>
                    {review.clientName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <RatingStar numberOfStars={review.rating} size={12} />
                    <Text style={{ fontSize: 12, color: secondaryTextColor, opacity: 0.7, marginLeft: 4 }}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {review.review && (
                <Text style={{ fontSize: 14, color: secondaryTextColor, lineHeight: 20 }}>
                  {review.review}
                </Text>
              )}
            </View>
          ))
        )}
        
        {/* Load More Button */}
        {hasMore && reviews.length > 0 && (
          <TouchableOpacity
            onPress={loadMoreReviews}
            style={{
              backgroundColor: primaryColor + '10',
              borderColor: primaryColor + '30',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Text style={{ color: primaryColor, fontSize: 14, fontWeight: '600' }}>
              Load More Reviews
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        professionalId={professionalId}
        professionalName={professionalName}
        jobId={jobId}
        orderId={orderId}
        onSuccess={handleRatingSubmitted}
      />
    </ScrollView>
  );
};

export default RatingDisplay;
