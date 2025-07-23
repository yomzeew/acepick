import { ProfessionalDetails } from "component/dashboardComponent/clientdetail";
import EmptyView from "component/emptyview";
import JobStatusBar from "component/jobStatusBar";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { memo } from "react";
import { TouchableOpacity, View,Text } from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { JobProps } from "type";



interface JobCardProps {
    job: JobProps;
    router: ReturnType<typeof useRouter>;
    onUpdate: () => void;
    onApprove: () => void;
  }
  
 export  const JobCard = memo(({ job, router, onUpdate, onApprove }: JobCardProps) => {
    
    /* Colors / theme */
    const { theme }  = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);

  
    /* Which main action button to show? */
    const showInvoice   = !!job.workmanship;
    const canApprove    = job.status === 'COMPLETED';
    const isPending     = job.status === 'PENDING';
  
  
    return (
      <View
        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
        className="rounded-xl p-4 mb-4"
      >
        <JobStatusBar status={job.status} />
  
        <ThemeText size={Textstyles.text_small}>{job.title}</ThemeText>
        <EmptyView height={10} />
        <ProfessionalDetails professionalId={job.professional.profile.professional.id}/>
  
        <EmptyView height={10} />
        <ThemeTextsecond size={Textstyles.text_xsma}>{job.description}</ThemeTextsecond>
  
        <EmptyView height={15} />
  
        <View className="flex-row justify-between">
          {/* LEFT button */}
          {showInvoice ? (
            <ActionBtn
              label="View Invoice"
              color={primaryColor}
              onPress={() => router.push(`/invoiceViewPageLayout?jobId=${job.id}`)}
            />
          ) : isPending ? (
            <ActionBtn
              label="Update Details"
              color={primaryColor}
              onPress={onUpdate}
            />
          ) : null}
  
          {/* RIGHT button */}
          {canApprove && (
            <ActionBtn
              label="Approve Payment"
              color={primaryColor}
              onPress={onApprove}
            />
          )}
        </View>
      </View>
    );
  });
  
  const ActionBtn = ({
    label,
    color,
    onPress,
  }: {
    label: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: color }}
      className="px-3 h-10 rounded-xl justify-center items-center"
    >
      <Text style={{ color: '#fff' }}>{label}</Text>
    </TouchableOpacity>
  );