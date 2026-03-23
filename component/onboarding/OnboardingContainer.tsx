import { View, Pressable, Text } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import OnboardingStepper from "./OnboardingStepper";
import EmailPhoneStep from "./steps/EmailPhoneStep";
import OtpVerificationStep from "./steps/OtpVerificationStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import ProfessionalInfoStep from "./steps/ProfessionalInfoStep";
import VehicleInfoStep from "./steps/VehicleInfoStep";
import PasswordStep from "./steps/PasswordStep";
import { Textstyles } from "static/textFontsize";

type RoleType = 'client' | 'artisan' | 'corperate' | 'delivery';

interface OnboardingContainerProps {
  role: RoleType;
}

const STEP_CONFIGS: Record<RoleType, string[]> = {
  client: ['Email & Phone', 'Verify OTP', 'Personal Info', 'Create Password'],
  artisan: ['Email & Phone', 'Verify OTP', 'Personal Info', 'Professional Info', 'Create Password'],
  corperate: ['Email & Phone', 'Verify OTP', 'Personal Info', 'Professional Info', 'Create Password'],
  delivery: ['Email & Phone', 'Verify OTP', 'Personal Info', 'Vehicle Info', 'Create Password'],
};

const getRoleLabel = (role: RoleType): string => {
  switch (role) {
    case 'client': return 'Client';
    case 'artisan': return 'Artisan';
    case 'corperate': return 'Corporate';
    case 'delivery': return 'Delivery Rider';
    default: return 'User';
  }
};

const OnboardingContainer = ({ role }: OnboardingContainerProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor } = getColors(theme);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const stepLabels = STEP_CONFIGS[role];
  const totalSteps = stepLabels.length;
  const roleLabel = getRoleLabel(role);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const onComplete = useCallback(() => {
    // Registration complete - handled by PasswordStep's SliderModal
  }, []);

  const renderStep = () => {
    // Steps 0 and 1 are always EmailPhone and OTP
    if (currentStep === 0) {
      return <EmailPhoneStep onNext={goNext} roleLabel={roleLabel} />;
    }
    if (currentStep === 1) {
      return <OtpVerificationStep onNext={goNext} />;
    }

    // Step 2 is always PersonalInfo
    if (currentStep === 2) {
      return <PersonalInfoStep onNext={goNext} roleLabel={roleLabel} />;
    }

    // Role-specific middle steps
    if (role === 'client') {
      // Client: step 3 = Password
      if (currentStep === 3) {
        return <PasswordStep role={role} onComplete={onComplete} />;
      }
    }

    if (role === 'artisan' || role === 'corperate') {
      // Professional: step 3 = ProfessionalInfo, step 4 = Password
      if (currentStep === 3) {
        return <ProfessionalInfoStep onNext={goNext} />;
      }
      if (currentStep === 4) {
        return <PasswordStep role={role} onComplete={onComplete} />;
      }
    }

    if (role === 'delivery') {
      // Delivery: step 3 = VehicleInfo, step 4 = Password
      if (currentStep === 3) {
        return <VehicleInfoStep onNext={goNext} />;
      }
      if (currentStep === 4) {
        return <PasswordStep role={role} onComplete={onComplete} />;
      }
    }

    return null;
  };

  return (
    <View style={{ backgroundColor, flex: 1 }}>
      {/* Header with back button and title */}
      <View className="flex-row items-center px-4 pt-14 pb-2">
        <Pressable onPress={goBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color={primaryTextColor} />
        </Pressable>
        <Text
          style={[Textstyles.text_small, { color: primaryTextColor, fontWeight: '700', flex: 1, textAlign: 'center' }]}
          className="mr-8"
        >
          Register as {roleLabel}
        </Text>
      </View>

      {/* Stepper */}
      <OnboardingStepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      {/* Step content */}
      <View className="flex-1">
        {renderStep()}
      </View>
    </View>
  );
};

export default OnboardingContainer;
