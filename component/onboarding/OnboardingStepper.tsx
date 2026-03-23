import { View, Text } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const OnboardingStepper = ({ currentStep, totalSteps, stepLabels }: OnboardingStepperProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor } = getColors(theme);

  return (
    <View className="w-full px-6 pt-4 pb-2">
      {/* Step indicator dots with connecting lines */}
      <View className="flex-row items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === totalSteps - 1;

          return (
            <View key={index} className="flex-row items-center" style={{ flex: isLast ? 0 : 1 }}>
              {/* Step circle */}
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: isCompleted || isActive ? primaryColor : 'transparent',
                  borderWidth: 2,
                  borderColor: isCompleted || isActive ? primaryColor : secondaryTextColor,
                }}
              >
                {isCompleted ? (
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                ) : (
                  <Text
                    style={{
                      color: isActive ? '#fff' : secondaryTextColor,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Connecting line */}
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isCompleted ? primaryColor : secondaryTextColor + '40',
                    marginHorizontal: 4,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Current step label */}
      <Text
        style={[Textstyles.text_xsmall, { color: primaryColor, textAlign: 'center', fontWeight: '600' }]}
        className="mt-1"
      >
        {stepLabels[currentStep] || ''}
      </Text>

      {/* Step counter */}
      <Text
        style={[Textstyles.text_xxxsmall, { color: secondaryTextColor, textAlign: 'center' }]}
        className="mt-1"
      >
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};

export default OnboardingStepper;
