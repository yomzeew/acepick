import { View, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';

interface StarRatingProps {
  maxStars?: number;
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  maxStars = 5,
  rating,
  onChange,
  size = 32,
  color,
}) => {
  const { theme } = useTheme();
  const { backgroundColortwo } = getColors(theme);
  const starColor = color || backgroundColortwo;
  return (
    <View className="flex-row items-center justify-center py-4">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        return (
          <TouchableOpacity
            key={starIndex}
            onPress={() => onChange(starIndex)}
            activeOpacity={0.7}
            style={{ marginHorizontal: 4 }}
          >
            <AntDesign
              name={starIndex <= rating ? 'star' : 'staro'}
              size={size}
              color={starColor}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StarRating;
