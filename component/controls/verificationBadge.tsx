import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { ThemeText } from 'component/ThemeText';
import { Textstyles } from 'static/textFontsize';
import { getColors } from 'static/color';
import { useTheme } from 'hooks/useTheme';

interface VerificationBadgeProps {
  isVerified: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  onPress,
  size = 'medium',
  showText = true
}) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, successColor, warningColor } = getColors(theme);

  const sizeStyles = {
    small: {
      container: 'px-2 py-1',
      icon: 14,
      text: Textstyles.text_xxxsmall
    },
    medium: {
      container: 'px-3 py-2',
      icon: 18,
      text: Textstyles.text_xsmall
    },
    large: {
      container: 'px-4 py-3',
      icon: 22,
      text: Textstyles.text_small
    }
  };

  const currentSize = sizeStyles[size];

  if (isVerified) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        disabled={!onPress}
        className={`flex-row items-center rounded-full ${currentSize.container}`}
        style={{ backgroundColor: successColor + '20', borderWidth: 1, borderColor: successColor }}
      >
        <MaterialCommunityIcons 
          name="check-decagram" 
          size={currentSize.icon} 
          color={successColor} 
        />
        {showText && (
          <Text 
            style={[currentSize.text, { color: successColor, marginLeft: 4 }]}
            className="font-medium"
          >
            Verified
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center rounded-full ${currentSize.container}`}
      style={{ backgroundColor: warningColor + '20', borderWidth: 1, borderColor: warningColor }}
    >
      <AntDesign 
        name="warning" 
        size={currentSize.icon} 
        color={warningColor} 
      />
      {showText && (
        <Text 
          style={[currentSize.text, { color: warningColor, marginLeft: 4 }]}
          className="font-medium"
        >
          Not Verified
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default VerificationBadge;
