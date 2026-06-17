import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { submitRating, RatingData } from 'services/ratingService';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  jobId?: string;
  orderId?: string;
  onSuccess?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  professionalId,
  professionalName,
  jobId,
  orderId,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, successColor, errorColor } = getColors(theme);
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData: RatingData = {
        rating,
        review: review.trim() || undefined,
        professionalId,
        jobId,
        orderId,
      };

      await submitRating(ratingData);
      onSuccess?.();
      onClose();
      // Reset form
      setRating(0);
      setReview('');
      setHoveredStar(0);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form
      setRating(0);
      setReview('');
      setHoveredStar(0);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredStar || rating);
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          onPressIn={() => setHoveredStar(i)}
          onPressOut={() => setHoveredStar(0)}
          disabled={isSubmitting}
          style={{ marginRight: 8 }}
        >
          <AntDesign
            name={isFilled ? 'star' : 'staro'}
            size={32}
            color={isFilled ? '#F59E0B' : '#D1D5DB'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    if (rating === 0) return 'Tap to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return '';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="w-11/12 max-w-sm rounded-2xl p-6"
          style={{ backgroundColor: selectioncardColor }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text
              style={{ fontSize: 18, fontWeight: '700', color: secondaryTextColor }}
              className="flex-1"
            >
              Rate {professionalName}
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <AntDesign name="close" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Rating Stars */}
            <View className="items-center mb-6">
              <View className="flex-row mb-3">{renderStars()}</View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: primaryColor }}>
                {getRatingText()}
              </Text>
              <Text style={{ fontSize: 14, color: secondaryTextColor, opacity: 0.7, marginTop: 4 }}>
                {rating > 0 ? `${rating}.0 out of 5.0` : ''}
              </Text>
            </View>

            {/* Review Input */}
            <View className="mb-6">
              <Text style={{ fontSize: 14, fontWeight: '600', color: secondaryTextColor, marginBottom: 8 }}>
                Review (Optional)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: borderColor,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  color: secondaryTextColor,
                  textAlignVertical: 'top',
                  minHeight: 100,
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB',
                }}
                placeholder="Share your experience with this professional..."
                placeholderTextColor={secondaryTextColor + '50'}
                value={review}
                onChangeText={setReview}
                multiline
                maxLength={500}
                editable={!isSubmitting}
              />
              <Text style={{ fontSize: 12, color: secondaryTextColor, opacity: 0.6, marginTop: 4 }}>
                {review.length}/500 characters
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              style={{
                backgroundColor: rating === 0 ? '#D1D5DB' : primaryColor,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                  Submit Rating
                </Text>
              )}
            </TouchableOpacity>

            {/* Info Text */}
            <View style={{ 
              backgroundColor: primaryColor + '10', 
              borderRadius: 8, 
              padding: 12, 
              marginTop: 16,
              borderLeftWidth: 3,
              borderColor: primaryColor
            }}>
              <View className="flex-row">
                <FontAwesome5 name="info-circle" size={16} color={primaryColor} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 12, color: secondaryTextColor, lineHeight: 18 }}>
                  Your rating helps other users make informed decisions and helps professionals improve their services.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RatingModal;
