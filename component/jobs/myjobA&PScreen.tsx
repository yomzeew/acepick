import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import { useEffect, useState, useCallback } from 'react';
  import { useMutation } from '@tanstack/react-query';
  import { Ionicons } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  
  import HeaderComponent from 'component/headerComp';
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import EmptyView from 'component/emptyview';
  import SectorSkeletonCard from 'component/sectorSkeletonCard';
  import JobStatusBar from 'component/jobStatusBar';
  import JobProgressStepper from 'component/jobs/JobProgressStepper';
  import { SliderModalNoScrollview } from 'component/slideupModalTemplate';
  import JobAlertScreen from './jobAlertScreen';
  import ButtonComponent from 'component/buttoncomponent';
  import { AlertMessageBanner } from 'component/AlertMessageBanner';
  import { ClientDetailsFromJob } from "component/dashboardComponent/clientDetailsFromJob";
  import ProfileSlideupModal from "component/profileSlideupModal";
  
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import { ThemeText } from 'component/ThemeText';
  import { MyJob } from 'types/type';
  import { useTheme } from 'hooks/useTheme';
  import { useIncomingJob } from 'hooks/useIncomingJob';
  import {
    completeJobFn,
    getAllJobs,
    jobAcceptDelineFn,
  } from 'services/userService';

  /* ─── Filter tabs ──────────────────────────────── */
  const TABS = [
    { key: '',          label: 'All',       icon: 'grid-outline' as const },
    { key: 'PENDING',   label: 'Pending',   icon: 'time-outline' as const },
    { key: 'ONGOING',   label: 'Active',    icon: 'play-circle-outline' as const },
    { key: 'COMPLETED', label: 'Done',      icon: 'checkmark-done-outline' as const },
    { key: 'APPROVED',  label: 'Approved',  icon: 'shield-checkmark-outline' as const },
  ];

  const currency = (n: number | null | undefined) =>
    `₦${(n ?? 0).toLocaleString()}`;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  /* ========================================================================== */
  
  const MyAPjobScreen = () => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, borderColor, secondaryTextColor } = getColors(theme);
  
    const [data, setData]                   = useState<MyJob[]>([]);
    const [statusFilter, setStatusFilter]   = useState<string>('');
    const [refreshing, setRefreshing]       = useState(false);
  
    const [showAlert, setShowAlert]         = useState(false);
    const { job }                           = useIncomingJob();
  
    const [showEndJob, setShowEndJob]       = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [banner, setBanner]               = useState<{type:'error'|'success';msg:string}|null>(null);
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [respondAction, setRespondAction] = useState<'accept' | 'decline'>('accept');
    
    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileModalData, setProfileModalData] = useState<{
      type: 'client';
      data: MyJob['client'];
    } | null>(null);

    useEffect(() => {
      if (banner) {
        const timer = setTimeout(() => setBanner(null), 4000);
        return () => clearTimeout(timer);
      }
    }, [banner]);

    const jobsMutation = useMutation({
      mutationFn: getAllJobs,
      onSuccess: (res) => setData(res.data),
      onError: (err: any) =>
        setBanner({ type: 'error', msg: err?.response?.data?.message ?? err?.message ?? 'Unable to fetch jobs' }),
      onSettled: () => setRefreshing(false),
    });

    const respondMutation = useMutation({
      mutationFn: jobAcceptDelineFn,
      onSuccess: () => {
        setBanner({ type: 'success', msg: respondAction === 'accept' ? 'Job accepted!' : 'Job declined' });
        setShowRespondModal(false);
        refetchJobs();
      },
      onError: (err: any) =>
        setBanner({ type: 'error', msg: err?.response?.data?.message ?? err?.message ?? 'Unable to respond to job' }),
    });

    const handleRespond = () => {
      if (selectedJobId) respondMutation.mutate({ id: selectedJobId, accepted: respondAction === 'accept' });
    };
  
    const refetchJobs = useCallback(() => {
      setRefreshing(true);
      const qs = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : null;
      jobsMutation.mutate(qs);
    }, [statusFilter]);
  
    const handleOpenClientProfile = (client: MyJob['client']) => {
      if (client) {
        setProfileModalData({
          type: 'client',
          data: client
        });
        setShowProfileModal(true);
      }
    };
  
    useEffect(() => { refetchJobs(); }, [statusFilter]);
    useEffect(() => { if (job) setShowAlert(true); }, [job]);
  
    return (
      <>
        {banner && <AlertMessageBanner type={banner.type} message={banner.msg} />}

        <ContainerTemplate>
          <View className="flex-1">
            <HeaderComponent title="My Jobs" />

            {/* ── Tab filters ── */}
            <View className="mt-3 mb-2">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
              >
                {TABS.map((tab) => {
                  const active = statusFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setStatusFilter(tab.key)}
                      className="flex-row items-center px-3.5 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? primaryColor : selectioncardColor,
                        borderWidth: active ? 0 : 1,
                        borderColor,
                        gap: 5,
                      }}
                    >
                      <Ionicons name={tab.icon} size={14} color={active ? '#fff' : secondaryTextColor} />
                      <Text style={{ color: active ? '#fff' : secondaryTextColor, fontSize: 12, fontWeight: active ? '700' : '500' }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Job list ── */}
            <ScrollView
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchJobs} />}
              contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {jobsMutation.isPending && !refreshing ? (
                [...Array(3)].map((_, i) => <SectorSkeletonCard key={i} />)
              ) : data.length ? (
                data.map((jobItem) => (
                  <ProfJobCard
                    key={jobItem.id}
                    item={jobItem}
                    onEndJobPress={() => {
                      setSelectedJobId(jobItem.id);
                      setShowEndJob(true);
                    }}
                    onAccept={() => {
                      setSelectedJobId(jobItem.id);
                      setRespondAction('accept');
                      setShowRespondModal(true);
                    }}
                    onDecline={() => {
                      setSelectedJobId(jobItem.id);
                      setRespondAction('decline');
                      setShowRespondModal(true);
                    }}
                    onProfileClick={handleOpenClientProfile}
                  />
                ))
              ) : (
                <View className="items-center justify-center py-20">
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: primaryColor + '12' }}
                  >
                    <Ionicons name="hammer-outline" size={36} color={primaryColor} />
                  </View>
                  <ThemeText size={Textstyles.text_cmedium}>No jobs found</ThemeText>
                  <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                    {statusFilter ? `No ${statusFilter.toLowerCase()} jobs` : 'Jobs assigned to you will appear here'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ContainerTemplate>

        {/* ── Socket alert ── */}
        {showAlert && job && (
          <JobAlertScreen item={job} showalertModal={showAlert} setshowalertModal={setShowAlert} />
        )}

        {/* ── Confirm end job modal ── */}
        <SliderModalNoScrollview showmodal={showEndJob} setshowmodal={setShowEndJob} modalHeight="50%">
          {selectedJobId && (
            <ConfirmEndJob
              jobId={selectedJobId}
              onClose={() => setShowEndJob(false)}
              onSuccess={refetchJobs}
            />
          )}
        </SliderModalNoScrollview>

        {/* ── Accept/Decline confirmation modal ── */}
        <SliderModalNoScrollview showmodal={showRespondModal} setshowmodal={setShowRespondModal} modalHeight="45%">
          <ConfirmRespondModal
            action={respondAction}
            loading={respondMutation.isPending}
            onConfirm={handleRespond}
            onCancel={() => setShowRespondModal(false)}
          />
        </SliderModalNoScrollview>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileSlideupModal
          isVisible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profileData={profileModalData}
        />
      )}
      </>
    );
  };
  
  export default MyAPjobScreen;

  /* ══════════════════════════════════════════════════════════ */
  /*  Professional Job Card                                     */
  /* ══════════════════════════════════════════════════════════ */
  
  interface ProfJobCardProps {
    item: MyJob;
    onEndJobPress: () => void;
    onAccept?: () => void;
    onDecline?: () => void;
    onProfileClick?: (client: MyJob['client']) => void;
  }
  
  const ProfJobCard = ({ item, onEndJobPress, onAccept, onDecline, onProfileClick }: ProfJobCardProps) => {
    const router = useRouter();
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor, borderColor, secondaryTextColor, backgroundColortwo } = getColors(theme);

    // Debug logging to check client data
    console.log('🔍 MyJobA&PScreen ProfJobCard Data:', {
      jobId: item.id,
      hasClient: !!item.client,
      clientId: item.clientId,
      clientData: item.client,
      hasClientProfile: !!item.client?.profile,
      clientProfileData: item.client?.profile,
      clientDetailsExpanded: item.client?.profile ? JSON.stringify(item.client.profile, null, 2) : 'null'
    });

    const totalAmount = (Number(item.workmanship) || 0) + (Number(item.materialsCost) || 0);
  
    return (
      <View
        style={{ backgroundColor: selectioncardColor, borderColor, borderWidth: 1, elevation: 2 }}
        className="rounded-2xl mb-4 overflow-hidden"
      >
        {/* Header */}
        <View className="flex-row items-start justify-between p-4 pb-2">
          <View style={{ flex: 1, marginRight: 8 }}>
            <ThemeText size={Textstyles.text_small}>{item.title}</ThemeText>
            <View className="flex-row items-center mt-1" style={{ gap: 6 }}>
              <Ionicons name="calendar-outline" size={12} color={secondaryTextColor} />
              <Text style={{ color: secondaryTextColor, fontSize: 11 }}>{formatDate(item.createdAt)}</Text>
              {item.fullAddress && (
                <>
                  <Text style={{ color: secondaryTextColor, fontSize: 11 }}>·</Text>
                  <Ionicons name="location-outline" size={12} color={secondaryTextColor} />
                  <Text style={{ color: secondaryTextColor, fontSize: 11 }} numberOfLines={1}>{item.fullAddress}</Text>
                </>
              )}
            </View>
          </View>
          <JobStatusBar status={item.status} />
        </View>

        {/* Compact progress */}
        <View className="px-4 py-2">
          <JobProgressStepper
            status={item.status}
            accepted={item.accepted}
            workmanship={item.workmanship}
            compact
          />
        </View>

        {/* Client info */}
        {item.client && (
          <View className="px-4 py-2">
            <ClientDetailsFromJob client={item.client} showActions={true} onProfileClick={() => onProfileClick?.(item.client)} />
          </View>
        )}

        {/* Description */}
        <View className="px-4 pb-2">
          <Text style={{ color: secondaryTextColor, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Footer */}
        {item.status !== 'REJECTED' && (
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
              {totalAmount <= 0 && (
                <Text style={{ fontSize: 12, color: secondaryTextColor, fontStyle: 'italic' }}>
                  No invoice yet
                </Text>
              )}
            </View>

            <View className="flex-row" style={{ gap: 8 }}>
              {item.workmanship ? (
                <ActionBtn
                  label="Invoice"
                  icon="receipt-outline"
                  color={primaryColor}
                  variant="outline"
                  onPress={() => router.push(`/invoiceViewPageLayout?jobId=${item.id}`)}
                />
              ) : item.accepted && item.status === 'PENDING' ? (
                <ActionBtn
                  label="Create Invoice"
                  icon="add-circle-outline"
                  color={primaryColor}
                  variant="filled"
                  onPress={() => router.push(`/invoiceLayout?jobId=${item.id}`)}
                />
              ) : null}
              {item.status === 'ONGOING' && (
                <ActionBtn
                  label="End Job"
                  icon="checkmark-circle-outline"
                  color={primaryColor}
                  variant="filled"
                  onPress={onEndJobPress}
                />
              )}
              {item.status === 'PENDING' && !item.accepted && onAccept && (
                <ActionBtn
                  label="Accept"
                  icon="checkmark-circle-outline"
                  color={primaryColor}
                  variant="filled"
                  onPress={onAccept}
                />
              )}
              {item.status === 'PENDING' && !item.accepted && onDecline && (
                <ActionBtn
                  label="Decline"
                  icon="close-circle-outline"
                  color={backgroundColortwo}
                  variant="outline"
                  onPress={onDecline}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  /* ─── Action Button ── */
  const ActionBtn = ({
    label, icon, color, variant = 'filled', onPress,
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

  /* ══════════════════════════════════════════════════════════ */
  /*  Confirm End Job Modal                                     */
  /* ══════════════════════════════════════════════════════════ */
  const ConfirmEndJob = ({
    jobId,
    onClose,
    onSuccess,
  }: {
    jobId: number;
    onClose: () => void;
    onSuccess: () => void;
  }) => {
    const { theme }        = useTheme();
    const { primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
    const completeMutation = useMutation({
      mutationFn: completeJobFn,
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Job marked as completed.' });
        onSuccess();
        onClose();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred';
        setMessage({ type: 'error', text: msg });
      },
    });
  
    return (
      <View className="flex-1 px-6 justify-center items-center">
        {message && <AlertMessageBanner type={message.type} message={message.text} />}

        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: primaryColor + '20' }}
        >
          <Ionicons name="checkmark-done" size={32} color={primaryColor} />
        </View>
  
        <ThemeText size={Textstyles.text_medium}>Mark Job Complete?</ThemeText>
        <EmptyView height={8} />
        <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
          The client will be notified and can then approve the job for payment release.
        </Text>
  
        <EmptyView height={24} />
  
        <ButtonComponent
          color={primaryColor}
          text={completeMutation.isPending ? 'Submitting…' : 'Confirm Completion'}
          textcolor="#fff"
          onPress={() => completeMutation.mutate(jobId)}
          disabled={completeMutation.isPending}
          isLoading={completeMutation.isPending}
        />
  
        <EmptyView height={10} />
        <TouchableOpacity onPress={onClose} className="py-2">
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ══════════════════════════════════════════════════════════ */
  /*  Confirm Accept / Decline Modal                           */
  /* ══════════════════════════════════════════════════════════ */
  const ConfirmRespondModal = ({
    action,
    loading,
    onConfirm,
    onCancel,
  }: {
    action: 'accept' | 'decline';
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme);
    const isAccept = action === 'accept';

    return (
      <View className="flex-1 px-6 justify-center items-center">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: isAccept ? primaryColor + '20' : backgroundColortwo + '20' }}
        >
          <Ionicons
            name={isAccept ? 'checkmark-circle' : 'close-circle'}
            size={32}
            color={isAccept ? primaryColor : backgroundColortwo}
          />
        </View>

        <ThemeText size={Textstyles.text_medium}>
          {isAccept ? 'Accept This Job?' : 'Decline This Job?'}
        </ThemeText>
        <EmptyView height={8} />
        <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
          {isAccept
            ? 'You will be assigned to this job. The client will be notified.'
            : 'This job will be removed from your list. The client will be notified.'}
        </Text>

        <EmptyView height={24} />

        <ButtonComponent
          color={isAccept ? primaryColor : backgroundColortwo}
          text={loading ? 'Processing…' : isAccept ? 'Accept Job' : 'Decline Job'}
          textcolor="#fff"
          disabled={loading}
          isLoading={loading}
          onPress={onConfirm}
        />

        <EmptyView height={10} />
        <TouchableOpacity onPress={onCancel} className="py-2">
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
  