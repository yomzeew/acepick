import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { Ionicons } from "@expo/vector-icons";

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const OnboardingStepper = ({ currentStep, totalSteps, stepLabels }: OnboardingStepperProps) => {
  const { theme } = useTheme();
  const { primaryColor, subText } = getColors(theme);
  const isDark = theme === 'dark';

  const progress = totalSteps > 1 ? currentStep / (totalSteps - 1) : 1;

  return (
    <View style={styles.wrapper}>
      {/* Dot + line row */}
      <View style={styles.dotRow}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done    = i < currentStep;
          const active  = i === currentStep;
          const isLast  = i === totalSteps - 1;
          return (
            <View key={i} style={[styles.dotCell, isLast ? { flex: 0 } : { flex: 1 }]}>
              {/* Circle */}
              <View style={[
                styles.circle,
                {
                  backgroundColor: done || active ? primaryColor : isDark ? '#374151' : '#E5E7EB',
                  borderColor: done || active ? primaryColor : isDark ? '#4B5563' : '#D1D5DB',
                  width:  active ? 30 : 24,
                  height: active ? 30 : 24,
                  borderRadius: active ? 15 : 12,
                },
              ]}>
                {done ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : (
                  <Text style={[styles.circleNum, { color: active ? '#fff' : isDark ? '#6B7280' : '#9CA3AF' }]}>
                    {i + 1}
                  </Text>
                )}
              </View>

              {/* Connector line */}
              {!isLast && (
                <View style={[styles.line, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                  <View style={[
                    styles.lineFill,
                    {
                      backgroundColor: primaryColor,
                      width: done ? '100%' : active ? '50%' : '0%',
                    },
                  ]} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Label + counter */}
      <View style={styles.labelRow}>
        <View style={[styles.labelPill, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '30' }]}>
          <Text style={[styles.labelText, { color: primaryColor }]}>
            {stepLabels[currentStep] ?? ''}
          </Text>
        </View>
        <Text style={[styles.counter, { color: subText }]}>
          {currentStep + 1} / {totalSteps}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },

  dotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dotCell: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
  },
  circleNum: { fontSize: 11, fontWeight: '700' },
  line: { flex: 1, height: 3, borderRadius: 2, marginHorizontal: 3, overflow: 'hidden' },
  lineFill: { height: '100%', borderRadius: 2 },

  labelRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelPill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  labelText: { fontSize: 12, fontWeight: '600', fontFamily: 'TTFirsNeueMedium' },
  counter:   { fontSize: 12, fontFamily: 'TTFirsNeue' },
});

export default OnboardingStepper;
