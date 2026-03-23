import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "hooks/useTheme"
import { getColors } from "static/color"

interface JobStatusProps {
  status: 'COMPLETED' | 'APPROVED' | 'DISPUTED' | 'PENDING' | 'DECLINED' | 'ONGOING' | 'CANCELED' | 'CANCELLED' | 'REJECTED' | string;
}

type StatusConfig = {
  bg: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const getStatusMap = (primary: string, secondary: string): Record<string, StatusConfig> => ({
  PENDING:   { bg: secondary + '15', color: secondary, icon: 'time-outline',             label: 'Pending' },
  ONGOING:   { bg: primary + '15',   color: primary,   icon: 'play-circle-outline',      label: 'In Progress' },
  COMPLETED: { bg: primary + '15',   color: primary,   icon: 'checkmark-done-outline',   label: 'Completed' },
  APPROVED:  { bg: primary + '15',   color: primary,   icon: 'shield-checkmark-outline', label: 'Approved' },
  DISPUTED:  { bg: secondary + '15', color: secondary, icon: 'warning-outline',          label: 'Disputed' },
  DECLINED:  { bg: secondary + '15', color: secondary, icon: 'close-circle-outline',     label: 'Declined' },
  REJECTED:  { bg: secondary + '15', color: secondary, icon: 'close-circle-outline',     label: 'Rejected' },
  CANCELED:  { bg: secondary + '15', color: secondary, icon: 'ban-outline',              label: 'Cancelled' },
  CANCELLED: { bg: secondary + '15', color: secondary, icon: 'ban-outline',              label: 'Cancelled' },
});

const JobStatusBar = ({ status }: JobStatusProps) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const STATUS_MAP = getStatusMap(primaryColor, backgroundColortwo);
  const DEFAULT_CONFIG: StatusConfig = { bg: backgroundColortwo + '15', color: backgroundColortwo, icon: 'help-circle-outline', label: 'Unknown' };
  const config = STATUS_MAP[status] || DEFAULT_CONFIG;

  return (
    <View
      className="flex-row items-center self-start rounded-full px-3 py-1.5"
      style={{ backgroundColor: config.bg, gap: 5 }}
    >
      <Ionicons name={config.icon} size={13} color={config.color} />
      <Text
        style={{ color: config.color, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 }}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default JobStatusBar