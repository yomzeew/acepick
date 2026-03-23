import OnboardingContainer from "component/onboarding/OnboardingContainer";
import { useLocalSearchParams } from "expo-router";

const OnboardingProfessional = () => {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const role = type === 'corperate' ? 'corperate' : 'artisan';
  return <OnboardingContainer role={role} />;
};

export default OnboardingProfessional;
