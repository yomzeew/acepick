import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import BvNActivation from '../../../component/professionalDashboard/bvnActivation';

const BVNActivationPage = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <BvNActivation />
    </View>
  );
};

export default BVNActivationPage;
