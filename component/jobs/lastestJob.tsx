import { ProfessionalDetails } from "component/dashboardComponent/clientdetail";
import JobStatusBar from "component/jobStatusBar";
import JobProgressStepper from "component/jobs/JobProgressStepper";
import { ThemeText } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { memo } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { JobProps } from "types/type";

const currency = (n: number | null | undefined) =>
  `₦${(n ?? 0).toLocaleString()}`;

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
};

interface JobCardProps {
  job: JobProps;
  router: ReturnType<typeof useRouter>;
  onUpdate: () => void;
  onApprove: () => void;
  onDispute?: () => void;
  onCancel?: () => void;
}

export const JobCard = memo(({ job, router, onUpdate, onApprove, onDispute, onCancel }: JobCardProps) => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, borderColor, secondaryTextColor, backgroundColortwo } = getColors(theme);

  const showInvoice = !!job.workmanship;
  const canApprove = job.status === 'COMPLETED';
  const isPending = job.status === 'PENDING';
  const totalAmount = (Number(job.workmanship) || 0) + (Number(job.materials) || 0);

  const professionalId = job.professional?.profile?.professional?.id;

  return (
    <View
      style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1, elevation: 2 }}
      className="rounded-2xl mb-4 overflow-hidden"
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between p-4 pb-2">
        <View style={{ flex: 1, marginRight: 8 }}>
          <ThemeText size={Textstyles.text_small}>{job.title}</ThemeText>
          <View className="flex-row items-center mt-1" style={{ gap: 6 }}>
            <Ionicons name="calendar-outline" size={12} color={secondaryTextColor} />
            <Text style={{ color: secondaryTextColor, fontSize: 11 }}>{formatDate(job.createdAt)}</Text>
            {job.fullAddress && (
              <>
                <Text style={{ color: secondaryTextColor, fontSize: 11 }}>·</Text>
                <Ionicons name="location-outline" size={12} color={secondaryTextColor} />
                <Text style={{ color: secondaryTextColor, fontSize: 11 }} numberOfLines={1}>{job.fullAddress}</Text>
              </>
            )}
          </View>
        </View>
        <JobStatusBar status={job.status} />
      </View>

      {/* Progress stepper */}
      <View className="px-4 py-2">
        <JobProgressStepper
          status={job.status}
          accepted={job.accepted}
          workmanship={job.workmanship}
          compact
        />
      </View>

      {/* Professional info */}
      {professionalId && (
        <View className="px-4 py-2">
          <ProfessionalDetails professionalId={professionalId} />
        </View>
      )}

      {/* Description */}
      <View className="px-4 pb-2">
        <Text style={{ color: secondaryTextColor, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
          {job.description}
        </Text>
      </View>

      {/* Footer: amount + actions */}
      <View
        className="flex-row items-center justify-between px-4 py-3 mt-1"
        style={{ backgroundColor: theme === 'dark' ? '#1F293766' : '#F9FAFB', borderTopWidth: 1, borderTopColor: borderColor }}
      >
        <View>
          {totalAmount > 0 && (
            <Text style={{ fontSize: 16, fontWeight: '700', color: primaryColor }}>
              {currency(totalAmount)}
            </Text>
          )}
          {totalAmount <= 0 && isPending && (
            <Text style={{ fontSize: 12, color: secondaryTextColor, fontStyle: 'italic' }}>
              Awaiting invoice
            </Text>
          )}
        </View>

        <View className="flex-row" style={{ gap: 8 }}>
          {showInvoice && (
            <ActionBtn
              label="Invoice"
              icon="receipt-outline"
              color={primaryColor}
              variant="outline"
              onPress={() => router.push(`/invoiceViewPageLayout?jobId=${job.id}`)}
            />
          )}
          {isPending && !showInvoice && job.accepted && (
            <ActionBtn
              label="Generate Invoice"
              icon="receipt-outline"
              color={primaryColor}
              variant="filled"
              onPress={() => router.push(`/invoicePageLayout?jobId=${job.id}`)}
            />
          )}
          {isPending && !showInvoice && !job.accepted && (
            <ActionBtn
              label="Awaiting"
              icon="time-outline"
              color={secondaryTextColor}
              variant="outline"
              onPress={() => {}}
            />
          )}
          {canApprove && (
            <ActionBtn
              label="Approve"
              icon="shield-checkmark-outline"
              color={primaryColor}
              variant="filled"
              onPress={onApprove}
            />
          )}
          {canApprove && onDispute && (
            <ActionBtn
              label="Dispute"
              icon="warning-outline"
              color={backgroundColortwo}
              variant="outline"
              onPress={onDispute}
            />
          )}
          {isPending && !job.accepted && onCancel && (
            <ActionBtn
              label="Cancel"
              icon="close-circle-outline"
              color={backgroundColortwo}
              variant="outline"
              onPress={onCancel}
            />
          )}
        </View>
      </View>
    </View>
  );
});

const ActionBtn = ({
  label,
  icon,
  color,
  variant = 'filled',
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  variant?: 'filled' | 'outline';
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center px-3 py-2 rounded-xl"
    style={{
      backgroundColor: variant === 'filled' ? color : 'transparent',
      borderWidth: variant === 'outline' ? 1.5 : 0,
      borderColor: color,
      gap: 5,
    }}
  >
    <Ionicons name={icon} size={14} color={variant === 'filled' ? '#fff' : color} />
    <Text style={{ color: variant === 'filled' ? '#fff' : color, fontSize: 12, fontWeight: '600' }}>
      {label}
    </Text>
  </TouchableOpacity>
);