import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';

type StepState = 'done' | 'active' | 'upcoming';

interface Step {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  state: StepState;
}

interface Props {
  status: string;
  accepted?: boolean;
  workmanship?: number | null;
  compact?: boolean;
}

const STEPS_CONFIG: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Requested', icon: 'document-text-outline' },
  { label: 'Accepted', icon: 'checkmark-circle-outline' },
  { label: 'Invoiced', icon: 'receipt-outline' },
  { label: 'Paid', icon: 'card-outline' },
  { label: 'Completed', icon: 'hammer-outline' },
  { label: 'Approved', icon: 'shield-checkmark-outline' },
];

function getActiveIndex(status: string, accepted?: boolean, workmanship?: number | null): number {
  switch (status) {
    case 'PENDING':
      if (!accepted) return 0;
      if (!workmanship) return 1;
      return 2;
    case 'ONGOING':
      return 3;
    case 'COMPLETED':
      return 4;
    case 'APPROVED':
      return 5;
    case 'DISPUTED':
      return 4; // completed but disputed
    case 'CANCELLED':
    case 'REJECTED':
    case 'DECLINED':
      return -1; // special
    default:
      return 0;
  }
}

const JobProgressStepper = ({ status, accepted, workmanship, compact = false }: Props) => {
  const { theme } = useTheme();
  const { primaryColor, successColor, backgroundColortwo } = getColors(theme);

  const isTerminal = ['CANCELLED', 'REJECTED', 'DECLINED', 'DISPUTED'].includes(status);
  const activeIdx = getActiveIndex(status, accepted, workmanship);

  const steps: Step[] = STEPS_CONFIG.map((s, i) => ({
    ...s,
    state: i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'upcoming',
  }));

  if (isTerminal && status === 'DISPUTED') {
    // Mark up to COMPLETED as done, show DISPUTED as active
    steps.forEach((s, i) => {
      if (i <= 4) s.state = 'done';
    });
    steps[4].state = 'active';
  }

  const terminalColor =
    status === 'DISPUTED' ? backgroundColortwo :
    status === 'CANCELLED' ? backgroundColortwo :
    status === 'REJECTED' ? backgroundColortwo :
    status === 'DECLINED' ? backgroundColortwo : '#6B7280';

  const doneColor = successColor || primaryColor;
  const activeColor = primaryColor || '#59C5E0';
  const upcomingColor = theme === 'dark' ? '#4B5563' : '#D1D5DB';
  const upcomingText = theme === 'dark' ? '#6B7280' : '#9CA3AF';

  if (compact) {
    return (
      <View className="flex-row items-center" style={{ gap: 2 }}>
        {steps.map((step, i) => (
          <View key={i} className="flex-row items-center">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  step.state === 'done' ? doneColor :
                  step.state === 'active' ? activeColor : upcomingColor,
              }}
            />
            {i < steps.length - 1 && (
              <View
                style={{
                  width: 12,
                  height: 2,
                  backgroundColor: step.state === 'done' ? doneColor : upcomingColor,
                }}
              />
            )}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {/* Terminal status banner */}
      {isTerminal && (
        <View
          className="flex-row items-center rounded-lg px-3 py-2 mb-3"
          style={{ backgroundColor: terminalColor + '20' }}
        >
          <Ionicons
            name={status === 'DISPUTED' ? 'warning-outline' : 'close-circle-outline'}
            size={18}
            color={terminalColor}
          />
          <Text
            className="ml-2 font-semibold text-xs"
            style={{ color: terminalColor }}
          >
            {status === 'DISPUTED' ? 'Job Disputed — Awaiting Resolution' :
             status === 'CANCELLED' ? 'Job Cancelled' :
             status === 'REJECTED' ? 'Job Rejected by Professional' :
             'Job Declined'}
          </Text>
        </View>
      )}

      {/* Stepper */}
      <View className="flex-row items-start justify-between">
        {steps.map((step, i) => {
          const color =
            step.state === 'done' ? doneColor :
            step.state === 'active' ? activeColor : upcomingColor;
          const textColor =
            step.state === 'done' ? doneColor :
            step.state === 'active' ? activeColor : upcomingText;

          return (
            <React.Fragment key={i}>
              <View className="items-center" style={{ width: 44 }}>
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: step.state === 'active' ? color + '20' : 'transparent',
                    borderWidth: step.state === 'upcoming' ? 1.5 : 0,
                    borderColor: upcomingColor,
                  }}
                >
                  {step.state === 'done' ? (
                    <View
                      className="items-center justify-center rounded-full"
                      style={{ width: 28, height: 28, backgroundColor: doneColor }}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  ) : (
                    <Ionicons name={step.icon} size={18} color={color} />
                  )}
                </View>
                <Text
                  className="text-center mt-1"
                  style={{ fontSize: 9, color: textColor, fontWeight: step.state === 'active' ? '700' : '500' }}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <View
                  className="mt-4"
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: step.state === 'done' ? doneColor : upcomingColor,
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default JobProgressStepper;
