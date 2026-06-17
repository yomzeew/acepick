import { View, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'

interface BackComponentProps {
  bordercolor: any;
  textcolor: any;
  /** Route to navigate to when there is no back history (e.g. arrived via payment redirect). */
  fallback?: string;
}

const BackComponent = ({ bordercolor, textcolor, fallback }: BackComponentProps) => {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (fallback) {
      router.replace(fallback as any);
    }
    // If neither, do nothing — avoids a crash on root screens
  };

  return (
    <View>
      <TouchableOpacity
        style={{ borderColor: bordercolor }}
        className="absolute left-3 border border-buttonGray rounded-xl p-2"
        onPress={handleBack}
      >
        <AntDesign name="left" size={20} color={textcolor} />
      </TouchableOpacity>
    </View>
  );
};

export default BackComponent;
