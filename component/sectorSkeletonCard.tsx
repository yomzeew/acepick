// component/sectorSkeletonCard.tsx
import { View } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';

const SectorSkeletonCard = () => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, borderColor } = getColors(theme);
  const shimmer = primaryColor + '18';

  return (
    <View 
      className="w-full"
      style={{
        backgroundColor: selectioncardColor,
        borderRadius: 20,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      {/* Top accent line skeleton */}
      <View 
        className="w-full h-3 rounded-t-lg mb-4"
        style={{ backgroundColor: shimmer }}
      />
      
      {/* Main content skeleton */}
      <View className="flex-row items-center">
        {/* Icon skeleton */}
        <View 
          className="w-14 h-14 rounded-xl mr-4"
          style={{ backgroundColor: shimmer }}
        />
        
        {/* Text skeleton */}
        <View className="flex-1">
          <View 
            className="h-5 rounded-lg mb-2 w-3/4"
            style={{ backgroundColor: shimmer }}
          />
          <View className="flex-row gap-4">
            <View 
              className="h-4 rounded w-16"
              style={{ backgroundColor: shimmer }}
            />
            <View 
              className="h-4 rounded w-16"
              style={{ backgroundColor: shimmer }}
            />
          </View>
        </View>
        
        {/* Arrow skeleton */}
        <View 
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: shimmer }}
        />
      </View>
      
      {/* Bottom accent line skeleton */}
      <View 
        className="w-full h-2 rounded-lg mt-4 mx-1"
        style={{ backgroundColor: shimmer, opacity: 0.6 }}
      />
    </View>
  );
};

export default SectorSkeletonCard;