import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Modal,
  } from 'react-native';
  import { useEffect, useState, useCallback } from 'react';
  import { useRouter } from 'expo-router';
  import { useMutation } from '@tanstack/react-query';
  import { Ionicons } from '@expo/vector-icons';
  
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import HeaderComponent   from 'component/headerComp';
  import EmptyView         from 'component/emptyview';
  import SectorSkeletonCard from 'component/sectorSkeletonCard';
  import {
    SliderModalNoScrollview,
  } from 'component/slideupModalTemplate';
  import ButtonComponent     from 'component/buttoncomponent';
  import {
    ThemeText,
    ThemeTextsecond,
  } from 'component/ThemeText';
  import { AlertMessageBanner } from 'component/AlertMessageBanner';
  import InputComponent, { InputComponentTextarea } from 'component/controls/textinput';
  import Divider from 'component/divider';
  import StarRating from 'component/starRating';
  import { JobCard } from './lastestJob';
  import ProfileSlideupModal from 'component/profileSlideupModal';
  
  import { useTheme }   from 'hooks/useTheme';
  
  import {
    getAllJobs,
    approvedJobFn,
    ratingGiveFn,
    updateJobFn,
    disputeJobFn,
    cancelJobFn,
  } from 'services/userService';
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import type { JobProps } from 'types/type';

  /* ─── Filter tabs config ──────────────────────────────── */
  const TABS = [
    { key: '',          label: 'All',        icon: 'grid-outline' as const },
    { key: 'PENDING',   label: 'Pending',    icon: 'time-outline' as const },
    { key: 'ONGOING',   label: 'Active',     icon: 'play-circle-outline' as const },
    { key: 'COMPLETED', label: 'Completed',  icon: 'checkmark-done-outline' as const },
    { key: 'APPROVED',  label: 'Approved',   icon: 'shield-checkmark-outline' as const },
    { key: 'DISPUTED',  label: 'Disputed',   icon: 'warning-outline' as const },
  ];

  /* ========================================================================== */
  
  const MyJobScreen = () => {
    const { theme }              = useTheme();
    const { primaryColor, selectioncardColor, borderColor, secondaryTextColor } = getColors(theme);
    const router                 = useRouter();
  
    const [confirmModal, setConfirmModal] = useState(false);
    const [updateModal,  setUpdateModal ] = useState(false);
    const [disputeModal, setDisputeModal] = useState(false);
    const [cancelModal,  setCancelModal]  = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDesc, setDisputeDesc]     = useState('');
  
    const [statusFilter, setStatusFilter] = useState('');
    const [jobs,  setJobs]                = useState<JobProps[]>([]);
    const [refreshing,   setRefreshing]   = useState(false);
    const [selectedJobId, setSelectedJob] = useState<number | null>(null);
    const [selectedJobData, setSelectedJobData] = useState<JobProps | null>(null);
    const [banner, setBanner]             = useState<{type:'error'|'success';msg:string}|null>(null);
    const [rating, setRating]             = useState(0);
    const [showModalRate, setShowModalRate] = useState(false);
    
    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileModalData, setProfileModalData] = useState<{
      type: 'professional' | 'client';
      data: JobProps['professional'] | JobProps['client'];
    } | null>(null);
  
    useEffect(() => {
      if (banner) {
        const timer = setTimeout(() => setBanner(null), 4000);
        return () => clearTimeout(timer);
      }
    }, [banner]);

    /* ── Fetch jobs ── */
    const fetchMutation = useMutation({
      mutationFn : getAllJobs,
      onSuccess  : (res) => setJobs(res.data),
      onError    : (err: any) =>
        setBanner({
          type: 'error',
          msg: err?.response?.data?.message ?? err?.message ?? 'Unable to fetch jobs',
        }),
      onSettled  : () => setRefreshing(false),
    });
  
    const loadJobs = useCallback(() => {
      setRefreshing(true);
      const qs = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : null;
      fetchMutation.mutate(qs);
    }, [statusFilter]);
  
    useEffect(loadJobs, [statusFilter]);
  
    /* ── Approve job ── */
    const approveMutation = useMutation({
      mutationFn : approvedJobFn,
      onSuccess  : () => {
        setBanner({ type: 'success', msg: 'Job approved successfully' });
        setConfirmModal(false);
        loadJobs();
        setShowModalRate(true);
      },
      onError    : (err: any) =>
        setBanner({
          type: 'error',
          msg: err?.response?.data?.message ?? err?.message ?? 'Unable to approve job',
        }),
    });

    const handleApprove = () => {
      if (selectedJobId) approveMutation.mutate(selectedJobId);
    };

    const handleOpenProfile = (data: { type: 'professional' | 'client'; data: JobProps['professional'] | JobProps['client'] }) => {
      setProfileModalData(data);
      setShowProfileModal(true);
    };
  
    /* ── Dispute job ── */
    const disputeMutation = useMutation({
      mutationFn: disputeJobFn,
      onSuccess: () => {
        setBanner({ type: 'success', msg: 'Dispute filed successfully' });
        setDisputeModal(false);
        setDisputeReason('');
        setDisputeDesc('');
        loadJobs();
      },
      onError: (err: any) =>
        setBanner({
          type: 'error',
          msg: err?.response?.data?.message ?? err?.message ?? 'Unable to file dispute',
        }),
    });

    const handleDispute = () => {
      if (selectedJobId && disputeReason.trim()) {
        disputeMutation.mutate({ jobId: selectedJobId, reason: disputeReason, description: disputeDesc });
      }
    };

    /* ── Cancel job ── */
    const cancelMutation = useMutation({
      mutationFn: cancelJobFn,
      onSuccess: () => {
        setBanner({ type: 'success', msg: 'Job cancelled successfully' });
        setCancelModal(false);
        loadJobs();
      },
      onError: (err: any) =>
        setBanner({
          type: 'error',
          msg: err?.response?.data?.message ?? err?.message ?? 'Unable to cancel job',
        }),
    });

    const handleCancel = () => {
      if (selectedJobId) cancelMutation.mutate(selectedJobId);
    };

    /* ── Rating ── */
    const ratingGiveMutation = useMutation({
      mutationFn : ratingGiveFn,
      onSuccess  : () => {
        setBanner({ type: 'success', msg: 'Rating given successfully' });
        setShowModalRate(false);
        setRating(0);
      },
      onError    : (err: any) =>
        setBanner({
          type: 'error',
          msg: err?.response?.data?.message ?? err?.message ?? 'Unable to give rating',
        }),
    });

    const handleRate = () => {
      if (selectedJobId) ratingGiveMutation.mutate({ jobId: selectedJobId, rating });
    };

    /* ================================================================== */
    return (
      <>
        {/* ── Rating modal ── */}
        <Modal visible={showModalRate} animationType="fade" transparent>
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View
              className="rounded-3xl p-6 items-center mx-6"
              style={{ backgroundColor: selectioncardColor, width: '85%' }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: primaryColor + '15' }}
              >
                <Ionicons name="star" size={32} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_medium}>Rate this Job</ThemeText>
              <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
                How was your experience with the professional?
              </Text>
              <StarRating maxStars={5} rating={rating} onChange={(val: number) => setRating(val)} />
              <View className="w-full mt-6" style={{ gap: 10 }}>
                <ButtonComponent
                  color={primaryColor}
                  text={ratingGiveMutation.isPending ? 'Submitting…' : 'Submit Rating'}
                  textcolor="#fff"
                  onPress={handleRate}
                  disabled={rating === 0}
                  isLoading={ratingGiveMutation.isPending}
                />
                <TouchableOpacity
                  onPress={() => { setShowModalRate(false); setRating(0); }}
                  className="py-2 items-center"
                >
                  <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Skip for now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Banners ── */}
        {banner && <AlertMessageBanner type={banner.type} message={banner.msg} />}
  
        {/* ── Confirm approve modal ── */}
        <SliderModalNoScrollview
          modalHeight="45%"
          showmodal={confirmModal}
          setshowmodal={setConfirmModal}
        >
          <ConfirmApproveModal
            loading={approveMutation.isPending}
            onConfirm={handleApprove}
            onCancel={() => setConfirmModal(false)}
          />
        </SliderModalNoScrollview>
  
        {/* ── Update job modal ── */}
        <SliderModalNoScrollview
          modalHeight="75%"
          showmodal={updateModal}
          setshowmodal={setUpdateModal}
        >
          <UpdateJobModal
            job={selectedJobData}
            onSuccess={() => {
              setUpdateModal(false);
              setBanner({ type: 'success', msg: 'Job updated successfully' });
              loadJobs();
            }}
            onError={(msg: string) => setBanner({ type: 'error', msg })}
            onClose={() => setUpdateModal(false)}
          />
        </SliderModalNoScrollview>

        {/* ── Dispute modal ── */}
        <SliderModalNoScrollview
          modalHeight="65%"
          showmodal={disputeModal}
          setshowmodal={setDisputeModal}
        >
          <DisputeJobModal
            loading={disputeMutation.isPending}
            reason={disputeReason}
            description={disputeDesc}
            onReasonChange={setDisputeReason}
            onDescriptionChange={setDisputeDesc}
            onConfirm={handleDispute}
            onCancel={() => { setDisputeModal(false); setDisputeReason(''); setDisputeDesc(''); }}
          />
        </SliderModalNoScrollview>

        {/* ── Cancel job modal ── */}
        <SliderModalNoScrollview
          modalHeight="45%"
          showmodal={cancelModal}
          setshowmodal={setCancelModal}
        >
          <ConfirmCancelModal
            loading={cancelMutation.isPending}
            onConfirm={handleCancel}
            onCancel={() => setCancelModal(false)}
          />
        </SliderModalNoScrollview>
  
        {/* ── Main page ── */}
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
                        borderColor: borderColor,
                        gap: 5,
                      }}
                    >
                      <Ionicons
                        name={tab.icon}
                        size={14}
                        color={active ? '#fff' : secondaryTextColor}
                      />
                      <Text
                        style={{
                          color: active ? '#fff' : secondaryTextColor,
                          fontSize: 12,
                          fontWeight: active ? '700' : '500',
                        }}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
  
            {/* ── Job list ── */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadJobs} />
              }
              showsVerticalScrollIndicator={false}
            >
              {fetchMutation.isPending && !refreshing ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SectorSkeletonCard key={i} />
                ))
              ) : jobs.length ? (
                jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    onUpdate={() => {
                      setSelectedJob(j.id);
                      setSelectedJobData(j);
                      setUpdateModal(true);
                    }}
                    onApprove={() => {
                      setSelectedJob(j.id);
                      setConfirmModal(true);
                    }}
                    onDispute={() => {
                      setSelectedJob(j.id);
                      setDisputeModal(true);
                    }}
                    onCancel={() => {
                      setSelectedJob(j.id);
                      setCancelModal(true);
                    }}
                    onOpenProfile={handleOpenProfile}
                    router={router}
                  />
                ))
              ) : (
                <View className="items-center justify-center py-20">
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: primaryColor + '12' }}
                  >
                    <Ionicons name="briefcase-outline" size={36} color={primaryColor} />
                  </View>
                  <ThemeText size={Textstyles.text_cmedium}>No jobs found</ThemeText>
                  <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                    {statusFilter ? `No ${statusFilter.toLowerCase()} jobs` : 'Your jobs will appear here'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ContainerTemplate>
      
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
  
  export default MyJobScreen;
  
  /* ══════════════════════════════════════════════════════════ */
  /*  Confirm Approve Modal                                    */
  /* ══════════════════════════════════════════════════════════ */
  const ConfirmApproveModal = ({
    loading,
    onConfirm,
    onCancel,
  }: {
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { theme }        = useTheme();
    const { primaryColor, selectioncardColor, secondaryTextColor } = getColors(theme);
  
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: primaryColor + '20' }}
        >
          <Ionicons name="shield-checkmark" size={32} color={primaryColor} />
        </View>

        <ThemeText size={Textstyles.text_medium}>Approve Job?</ThemeText>
        <EmptyView height={8} />
        <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
          By approving, the payment will be released to the professional. This action cannot be undone.
        </Text>

        <EmptyView height={24} />
  
        <ButtonComponent
          color={primaryColor}
          text={loading ? 'Processing…' : 'Approve & Release Payment'}
          textcolor="#fff"
          disabled={loading}
          isLoading={loading}
          onPress={onConfirm}
        />
  
        <EmptyView height={10} />
        <TouchableOpacity onPress={onCancel} className="py-2">
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  /* ══════════════════════════════════════════════════════════ */
  /*  Update Job Modal                                         */
  /* ══════════════════════════════════════════════════════════ */
  const UpdateJobModal = ({
    job,
    onSuccess,
    onError,
    onClose,
  }: {
    job: JobProps | null;
    onSuccess: () => void;
    onError: (msg: string) => void;
    onClose: () => void;
  }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
    const [title, setTitle] = useState(job?.title ?? '');
    const [description, setDescription] = useState(job?.description ?? '');
    const [address, setAddress] = useState(job?.fullAddress ?? '');

    useEffect(() => {
      if (job) {
        setTitle(job.title ?? '');
        setDescription(job.description ?? '');
        setAddress(job.fullAddress ?? '');
      }
    }, [job]);

    const mutation = useMutation({
      mutationFn: updateJobFn,
      onSuccess: () => onSuccess(),
      onError: (err: any) =>
        onError(err?.response?.data?.message ?? err?.message ?? 'Failed to update job'),
    });

    const hasChanges =
      title !== (job?.title ?? '') ||
      description !== (job?.description ?? '') ||
      address !== (job?.fullAddress ?? '');

    const handleSubmit = () => {
      if (!job) return;
      const payload: any = { jobId: job.id };
      if (title && title !== job.title) payload.title = title;
      if (description && description !== job.description) payload.description = description;
      if (address && address !== job.fullAddress) payload.address = address;
      mutation.mutate(payload);
    };

    return (
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-4" style={{ gap: 10 }}>
          <View
            style={{ backgroundColor: primaryColor + '20' }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Ionicons name="create-outline" size={18} color={primaryColor} />
          </View>
          <View className="flex-1">
            <ThemeText size={Textstyles.text_cmedium}>Update Job</ThemeText>
            <Text style={{ color: secondaryTextColor, fontSize: 11 }}>
              Edit the details below and save
            </Text>
          </View>
        </View>
        <Divider />
        <EmptyView height={16} />

        {/* Title field */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-3"
        >
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons name="text-outline" size={14} color={primaryColor} />
            <Text style={{ color: primaryColor, fontSize: 13, fontFamily: 'TTFirsNeueMedium' }}>
              Job Title
            </Text>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder="Enter job title"
            placeholdercolor={secondaryTextColor}
            value={title}
            onChange={setTitle}
          />
        </View>

        {/* Description field */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-3"
        >
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons name="document-text-outline" size={14} color={primaryColor} />
            <Text style={{ color: primaryColor, fontSize: 13, fontFamily: 'TTFirsNeueMedium' }}>
              Description
            </Text>
          </View>
          <InputComponentTextarea
            color={primaryColor}
            placeholder="Describe the job..."
            placeholdercolor={secondaryTextColor}
            value={description}
            onChange={setDescription}
          />
        </View>

        {/* Address field */}
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-2xl px-4 py-4 mb-4"
        >
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons name="location-outline" size={14} color={primaryColor} />
            <Text style={{ color: primaryColor, fontSize: 13, fontFamily: 'TTFirsNeueMedium' }}>
              Address
            </Text>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder="Job address"
            placeholdercolor={secondaryTextColor}
            value={address}
            onChange={setAddress}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={mutation.isPending || !hasChanges}
          style={{
            backgroundColor: hasChanges ? primaryColor : secondaryTextColor + '30',
            opacity: mutation.isPending ? 0.7 : 1,
          }}
          className="h-14 rounded-2xl items-center justify-center flex-row mb-3"
        >
          {mutation.isPending ? (
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'TTFirsNeueMedium' }}>
              Updating…
            </Text>
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={hasChanges ? '#fff' : secondaryTextColor}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: hasChanges ? '#fff' : secondaryTextColor,
                  fontSize: 15,
                  fontFamily: 'TTFirsNeueMedium',
                }}
              >
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} className="py-2 items-center mb-4">
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* ══════════════════════════════════════════════════════════ */
  /*  Dispute Job Modal                                        */
  /* ══════════════════════════════════════════════════════════ */
  const DisputeJobModal = ({
    loading,
    reason,
    description,
    onReasonChange,
    onDescriptionChange,
    onConfirm,
    onCancel,
  }: {
    loading: boolean;
    reason: string;
    description: string;
    onReasonChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);

    return (
      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: backgroundColortwo + '20' }}
          >
            <Ionicons name="warning" size={32} color={backgroundColortwo} />
          </View>
          <ThemeText size={Textstyles.text_medium}>Dispute This Job?</ThemeText>
          <EmptyView height={4} />
          <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
            Please provide a reason for the dispute. An admin will review and resolve it.
          </Text>
        </View>

        <View style={{ backgroundColor: selectioncardColor }} className="rounded-2xl px-4 py-4 mb-3">
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons name="alert-circle-outline" size={14} color={backgroundColortwo} />
            <Text style={{ color: backgroundColortwo, fontSize: 13, fontFamily: 'TTFirsNeueMedium' }}>
              Reason *
            </Text>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder="e.g. Incomplete work, Poor quality"
            placeholdercolor={secondaryTextColor}
            value={reason}
            onChange={onReasonChange}
          />
        </View>

        <View style={{ backgroundColor: selectioncardColor }} className="rounded-2xl px-4 py-4 mb-4">
          <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
            <Ionicons name="document-text-outline" size={14} color={primaryColor} />
            <Text style={{ color: primaryColor, fontSize: 13, fontFamily: 'TTFirsNeueMedium' }}>
              Description
            </Text>
          </View>
          <InputComponentTextarea
            color={primaryColor}
            placeholder="Provide more details about the issue..."
            placeholdercolor={secondaryTextColor}
            value={description}
            onChange={onDescriptionChange}
          />
        </View>

        <ButtonComponent
          color={backgroundColortwo}
          text={loading ? 'Submitting…' : 'File Dispute'}
          textcolor="#fff"
          disabled={loading || !reason.trim()}
          isLoading={loading}
          onPress={onConfirm}
        />
        <EmptyView height={10} />
        <TouchableOpacity onPress={onCancel} className="py-2 items-center mb-4">
          <Text style={{ color: secondaryTextColor, fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* ══════════════════════════════════════════════════════════ */
  /*  Confirm Cancel Job Modal                                 */
  /* ══════════════════════════════════════════════════════════ */
  const ConfirmCancelModal = ({
    loading,
    onConfirm,
    onCancel,
  }: {
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { theme } = useTheme();
    const { primaryColor, secondaryTextColor, backgroundColortwo } = getColors(theme);

    return (
      <View className="flex-1 justify-center items-center px-6">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: backgroundColortwo + '20' }}
        >
          <Ionicons name="close-circle" size={32} color={backgroundColortwo} />
        </View>

        <ThemeText size={Textstyles.text_medium}>Cancel This Job?</ThemeText>
        <EmptyView height={8} />
        <Text style={{ color: secondaryTextColor, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
          This will cancel the job request. The professional will be notified. This action cannot be undone.
        </Text>

        <EmptyView height={24} />

        <ButtonComponent
          color={backgroundColortwo}
          text={loading ? 'Cancelling…' : 'Cancel Job'}
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
  