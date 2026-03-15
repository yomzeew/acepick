    import { View } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import { useMemo } from "react"

interface RatingStarProps {
    numberOfStars: number;
    size?: number;
    showValue?: boolean;
}

const RatingStar = ({ numberOfStars, size = 16, showValue = false }: RatingStarProps) => {
    const fullStars = Math.floor(numberOfStars);
    const hasHalfStar = numberOfStars % 1 !== 0;
    const emptyStars = 5 - Math.ceil(numberOfStars);

    const renderStars = useMemo(() => {
        const stars = [];
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <AntDesign key={`full-${i}`} color="#facc15" name="star" size={size} />
            );
        }
        
        // Half star
        if (hasHalfStar) {
            stars.push(
                <View key="half" style={{ position: 'relative' }}>
                    <AntDesign color="#d1d5db" name="staro" size={size} />
                    <AntDesign 
                        color="#facc15" 
                        name="star" 
                        size={size} 
                        style={{ position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden' }}
                    />
                </View>
            );
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <AntDesign key={`empty-${i}`} color="#d1d5db" name="staro" size={size} />
            );
        }
        
        return stars;
    }, [numberOfStars, size, fullStars, hasHalfStar, emptyStars]);

    return (
        <View className="flex-row items-center">
            {renderStars}
            {showValue && (
                <View className="ml-2">
                    <AntDesign name="infocirlceo" size={12} color="#9ca3af" />
                </View>
            )}
        </View>
    );
};

export default RatingStar;
