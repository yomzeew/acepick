import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeText, ThemeTextsecond } from 'component/ThemeText';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import SliderModalTemplate from 'component/slideupModalTemplate';

interface BVNInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const BVNInfoModal: React.FC<BVNInfoModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, backgroundColor, successColor, warningColor, errorColor } = getColors(theme);

  const infoPoints = [
    {
      icon: 'shield-check' as const,
      title: 'Identity Verification',
      description: 'BVN verifies your identity, ensuring you are who you claim to be',
      color: successColor,
    },
    {
      icon: 'account-check' as const,
      title: 'Build Trust',
      description: 'Verified professionals receive more job opportunities and client trust',
      color: primaryColor,
    },
    {
      icon: 'security' as const,
      title: 'Security & Safety',
      description: 'Protects all users by preventing fraud and ensuring a safe platform',
      color: warningColor,
    },
    {
      icon: 'bank' as const,
      title: 'Financial Compliance',
      description: 'Required by Nigerian regulations for financial transactions and services',
      color: errorColor,
    },
    {
      icon: 'star' as const,
      title: 'Premium Features',
      description: 'Unlock advanced features and higher earning potential',
      color: successColor,
    },
    {
      icon: 'handshake' as const,
      title: 'Professional Credibility',
      description: 'Stand out as a verified professional in the marketplace',
      color: primaryColor,
    },
  ];

  return (
    <SliderModalTemplate modalHeight={'75%'} showmodal={visible} setshowmodal={onClose}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="items-center py-4">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: primaryColor + '20' }}
          >
            <MaterialCommunityIcons name="help-circle" size={32} color={primaryColor} />
          </View>
          <ThemeText size={Textstyles.text_medium} className="text-center">
            Why Provide Your BVN?
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_small} className="text-center mt-2 px-4">
            Your Bank Verification Number helps us create a secure and trusted platform
          </ThemeTextsecond>
        </View>

        {/* Info Points */}
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="space-y-4">
            {infoPoints.map((point, index) => (
              <View 
                key={index}
                className="flex-row p-4 rounded-xl"
                style={{ backgroundColor: backgroundColor + '50', borderWidth: 1, borderColor: point.color + '30' }}
              >
                <View 
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: point.color + '20' }}
                >
                  <MaterialCommunityIcons name={point.icon} size={24} color={point.color} />
                </View>
                <View className="flex-1">
                  <ThemeText size={Textstyles.text_small} className="font-medium">
                    {point.title}
                  </ThemeText>
                  <ThemeTextsecond size={Textstyles.text_xsmall} className="mt-1 leading-relaxed">
                    {point.description}
                  </ThemeTextsecond>
                </View>
              </View>
            ))}
          </View>

          {/* Privacy Note */}
          <View className="mt-6 p-4 rounded-xl" style={{ backgroundColor: warningColor + '10', borderWidth: 1, borderColor: warningColor + '30' }}>
            <View className="flex-row items-start">
              <AntDesign name="infocirlce" size={20} color={warningColor} style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <ThemeText size={Textstyles.text_small} className="font-medium" style={{ color: warningColor }}>
                  Privacy & Security
                </ThemeText>
                <ThemeTextsecond size={Textstyles.text_xsmall} className="mt-2 leading-relaxed">
                  Your BVN is encrypted and securely stored. We only use it for identity verification and compliance purposes. Your personal information is never shared without consent.
                </ThemeTextsecond>
              </View>
            </View>
          </View>

          {/* Regulatory Note */}
          <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: primaryColor + '10', borderWidth: 1, borderColor: primaryColor + '30' }}>
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="bank" size={20} color={primaryColor} style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <ThemeText size={Textstyles.text_small} className="font-medium" style={{ color: primaryColor }}>
                  Regulatory Requirement
                </ThemeText>
                <ThemeTextsecond size={Textstyles.text_xsmall} className="mt-2 leading-relaxed">
                  As a regulated platform, we're required to verify user identities to comply with Nigerian financial regulations and anti-money laundering laws.
                </ThemeTextsecond>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="py-4">
          <TouchableOpacity
            onPress={onClose}
            className="w-full p-4 rounded-xl items-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              I Understand
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SliderModalTemplate>
  );
};

export default BVNInfoModal;
