import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OnboardingStepper from "./OnboardingStepper";
import EmailPhoneStep from "./steps/EmailPhoneStep";
import OtpVerificationStep from "./steps/OtpVerificationStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import ProfessionalInfoStep from "./steps/ProfessionalInfoStep";
import VehicleInfoStep from "./steps/VehicleInfoStep";
import PasswordStep from "./steps/PasswordStep";

type RoleType = 'client' | 'artisan' | 'corperate' | 'delivery';

interface OnboardingContainerProps {
  role: RoleType;
}

const STEP_CONFIGS: Record<RoleType, string[]> = {
  client:    ['Email & Phone', 'Verify OTP', 'Personal Info', 'Create Password'],
  artisan:   ['Email & Phone', 'Verify OTP', 'Personal Info', 'Professional Info', 'Create Password'],
  corperate: ['Email & Phone', 'Verify OTP', 'Personal Info', 'Professional Info', 'Create Password'],
  delivery:  ['Email & Phone', 'Verify OTP', 'Personal Info', 'Vehicle Info', 'Create Password'],
};

const ROLE_META: Record<RoleType, { label: string; tagline: string; icon: any }> = {
  client:    { label: 'Client',          tagline: 'Book services and shop on your terms',      icon: 'person-outline' },
  artisan:   { label: 'Artisan',         tagline: 'Offer your skills and grow your business',  icon: 'construct-outline' },
  corperate: { label: 'Corporate',       tagline: 'Scale your workforce with top professionals',icon: 'business-outline' },
  delivery:  { label: 'Delivery Rider',  tagline: 'Deliver packages and earn on your schedule', icon: 'bicycle-outline' },
};

const OnboardingContainer = ({ role }: OnboardingContainerProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, subText } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const stepLabels = STEP_CONFIGS[role];
  const totalSteps = stepLabels.length;
  const { label: roleLabel, tagline, icon } = ROLE_META[role];

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) setCurrentStep((p) => p + 1);
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
    else router.back();
  }, [currentStep, router]);

  const onComplete = useCallback(() => {}, []);

  const renderStep = () => {
    if (currentStep === 0) return <EmailPhoneStep onNext={goNext} roleLabel={roleLabel} />;
    if (currentStep === 1) return <OtpVerificationStep onNext={goNext} />;
    if (currentStep === 2) return <PersonalInfoStep onNext={goNext} roleLabel={roleLabel} />;

    if (role === 'client') {
      if (currentStep === 3) return <PasswordStep role={role} onComplete={onComplete} />;
    }
    if (role === 'artisan' || role === 'corperate') {
      if (currentStep === 3) return <ProfessionalInfoStep onNext={goNext} />;
      if (currentStep === 4) return <PasswordStep role={role} onComplete={onComplete} />;
    }
    if (role === 'delivery') {
      if (currentStep === 3) return <VehicleInfoStep onNext={goNext} />;
      if (currentStep === 4) return <PasswordStep role={role} onComplete={onComplete} />;
    }
    return null;
  };

  return (
    <View style={[styles.root, { backgroundColor }]}>
      {/* Coloured top strip */}
      <View style={[styles.strip, { backgroundColor: primaryColor }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={primaryTextColor} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Role icon badge */}
          <View style={[styles.iconBadge, { backgroundColor: primaryColor + '18', borderColor: primaryColor + '30' }]}>
            <Ionicons name={icon} size={22} color={primaryColor} />
          </View>
          <Text style={[styles.headerTitle, { color: primaryTextColor }]}>
            Register as {roleLabel}
          </Text>
          <Text style={[styles.headerTagline, { color: subText }]}>{tagline}</Text>
        </View>

        {/* Spacer to balance back button */}
        <View style={{ width: 40 }} />
      </View>

      {/* Stepper */}
      <OnboardingStepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      {/* Step content */}
      <View style={{ flex: 1 }}>
        {renderStep()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  strip: { height: 4, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  iconBadge: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700',
    fontFamily: 'TTFirsNeueMedium',
    textAlign: 'center',
  },
  headerTagline: {
    fontSize: 12,
    fontFamily: 'TTFirsNeue',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 16,
  },
});

export default OnboardingContainer;
