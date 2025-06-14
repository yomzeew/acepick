import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity
  } from 'react-native'
  import { useEffect, useState, memo } from 'react';
  import { useRouter } from 'expo-router';
  import { useMutation } from '@tanstack/react-query';
  import {
    AntDesign,
    FontAwesome5,
  } from '@expo/vector-icons';
  
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import HeaderComponent   from 'component/headerComp';
  import EmptyView         from 'component/emptyview';
  import SectorSkeletonCard from 'component/sectorSkeletonCard';
  import JobStatusBar       from 'component/jobStatusBar';
  import {
    SliderModalNoScrollview,
  } from 'component/slideupModalTemplate';
  import { FilterModalByStatus } from 'component/filtermodalByItems';
  import ButtonComponent     from 'component/buttoncomponent';
  import {
    ThemeText,
    ThemeTextsecond,
  } from 'component/ThemeText';

  import { AlertMessageBanner } from 'component/AlertMessageBanner';
  
  import { useTheme }   from 'hooks/useTheme';
  import { useIncomingJob } from 'hooks/useIncomingJob';
  
  import {
    getAllJobs,
    approvedJobFn,
  } from 'services/userService';
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import type { JobProps } from 'type';
import JobAlertScreen from './jobAlertScreen';
import InputComponent, { InputComponentTextarea } from 'component/controls/textinput';
import Divider from 'component/divider';
import ButtonFunction from 'component/buttonfunction';
import { ProfessionalDetails } from 'component/dashboardComponent/clientdetail';
  
  /* -------------------------------------------------------------------------- */
  
  const MyJobScreen = () => {
    /* ──────────────── basic hooks/colours/state ──────────────── */
    const { theme }              = useTheme();
    const { primaryColor }       = getColors(theme);
  
    const router                 = useRouter();
  
    const [filterModal, setFilterModal]   = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [updateModal,  setUpdateModal ] = useState(false);
  
    const [statusFilter, setStatusFilter] = useState('');
    const [jobs,  setJobs]                = useState<JobProps[]>([]);
    const [refreshing,        setRefreshing]   = useState(false);
    const [selectedJobId,     setSelectedJob]  = useState<number | null>(null);
    const [banner, setBanner]              = useState<{type:'error'|'success';msg:string}|null>(null);
  
  
    /* ──────────────── fetch jobs from API ──────────────── */
    const fetchMutation = useMutation({
      mutationFn : getAllJobs,
      onSuccess  : (res) => setJobs(res.data),
      onError    : (err: any) =>
        setBanner({
          type:'error',
          msg:
            err?.response?.data?.message ??
            err?.response?.data?.error   ??
            err?.message                 ??
            'Unable to fetch jobs',
        }),
      onSettled  : () => setRefreshing(false),
    });
  
    const loadJobs = () => {
      setRefreshing(true);
      const qs = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : null;
      fetchMutation.mutate(qs);
    };
  
    useEffect(loadJobs, [statusFilter]);     // fetch on mount + on filter change
  
    /* ──────────────── approve‑job mutation ──────────────── */
    const approveMutation = useMutation({
      mutationFn : approvedJobFn,
      onSuccess  : () => {
        setBanner({type:'success', msg:'Job approved successfully'});
        setConfirmModal(false);
        loadJobs();
      },
      onError    : (err: any) =>
        setBanner({
          type:'error',
          msg:
            err?.response?.data?.message ??
            err?.response?.data?.error   ??
            err?.message                 ??
            'Unable to approve job',
        }),
    });
  
    const handleApprove = () => {
      if (selectedJobId) approveMutation.mutate(selectedJobId);
    };
  
    /* ------------------------------------------------------------------ */
    /*                            RENDER                                  */
    /* ------------------------------------------------------------------ */
    return (
      <>
        {/* banners */}
        {banner && (
          <AlertMessageBanner
            type={banner.type}
            message={banner.msg}
          />
        )}
  
        {/* filter modal */}
        <SliderModalNoScrollview
          modalHeight="30%"
          showmodal={filterModal}
          setshowmodal={setFilterModal}
        >
          <FilterModalByStatus
            showmodal={filterModal}
            setshowmodal={setFilterModal}
            setStatus={setStatusFilter}
          />
        </SliderModalNoScrollview>
  
        {/* confirm‑approve modal */}
        <SliderModalNoScrollview
          modalHeight="50%"
          showmodal={confirmModal}
          setshowmodal={setConfirmModal}
        >
          <ConfirmApproveModal
            loading={approveMutation.isPending}
            onConfirm={handleApprove}
            onCancel={() => setConfirmModal(false)}
          />
        </SliderModalNoScrollview>
  
        {/* (Optional) update‑job modal stub */}
        <SliderModalNoScrollview
          modalHeight="80%"
          showmodal={updateModal}
          setshowmodal={setUpdateModal}
        >
          <UpdateJobPlaceholder />
        </SliderModalNoScrollview>
  
        {/* main page */}
        <ContainerTemplate>
          <View className="flex-1">
            <HeaderComponent title="My Jobs" />
            <EmptyView height={20} />
  
            {/* filter button */}
            <View className="absolute right-3 top-28 z-10">
              <TouchableOpacity
                onPress={() => setFilterModal(true)}
                style={{ backgroundColor: primaryColor }}
                className="px-3 py-2 rounded-full"
              >
                <AntDesign name="filter" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
  
            {/* list */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadJobs} />
              }
              showsVerticalScrollIndicator={false}
            >
              {fetchMutation.isPending && !refreshing ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <SectorSkeletonCard key={i} />
                ))
              ) : jobs.length ? (
                jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    onUpdate={() => {
                      setSelectedJob(j.id);
                      setUpdateModal(true);
                    }}
                    onApprove={() => {
                      setSelectedJob(j.id);
                      setConfirmModal(true);
                    }}
                    router={router}
                  />
                ))
              ) : (
                <ThemeTextsecond size={Textstyles.text_cmedium}>
                  No Record
                </ThemeTextsecond>
              )}
            </ScrollView>
          </View>
        </ContainerTemplate>
      </>
    );
  };
  
  export default MyJobScreen;
  
  interface JobCardProps {
    job: JobProps;
    router: ReturnType<typeof useRouter>;
    onUpdate: () => void;
    onApprove: () => void;
  }
  
  const JobCard = memo(({ job, router, onUpdate, onApprove }: JobCardProps) => {
    /* Colors / theme */
    const { theme }        = useTheme();
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

  
  const ConfirmApproveModal = ({
    loading,
    onConfirm,
    onCancel,
  }: {
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    const { theme }          = useTheme();
    const { primaryColor }   = getColors(theme);
  
    return (
      <View className="flex-1 justify-center items-center px-6">
        <ThemeText size={Textstyles.text_medium}>Confirm approval</ThemeText>
        <EmptyView height={10} />
        <ThemeTextsecond size={Textstyles.text_xsma}>
          Are you sure you want to approve this job for payment?
        </ThemeTextsecond>
  
        <EmptyView height={30} />
  
        <ButtonComponent
          color={primaryColor}
          text={loading ? 'Submitting…' : 'Approve'}
          textcolor="#fff"
          disabled={loading}
          onPress={onConfirm}
        />
  
        <EmptyView height={15} />
        <ButtonComponent
          color="#e5e7eb"
          text="Cancel"
          textcolor={primaryColor}
          onPress={onCancel}
        />
      </View>
    );
  };
  
  
  const UpdateJobPlaceholder = () => {
    const { theme } = useTheme()
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme)
    const [title, setTitle] = useState('')
    const [numOfJobs, setNumOfJobs] = useState(0)
    const [description, setDescription] = useState('')
    // const [manualaddress, setManualAddress] = useState('')
  
    return (
     <>
      <View className="flex-row justify-between items-center">
                    <ThemeTextsecond size={Textstyles.text_cmedium}>
                        Update Details
                    </ThemeTextsecond>
                </View>
                <Divider />
                <EmptyView height={20} />
                <InputComponent
                    color={primaryColor}
                    placeholder={"Job title"}
                    placeholdercolor={secondaryTextColor}
                    value={title}
                    onChange={setTitle}
                />
                <EmptyView height={20} />
                <ThemeTextsecond size={Textstyles.text_small}>No of Jobs</ThemeTextsecond>
                <InputComponent
                    keyboardType="numeric"
                    color={primaryColor}
                    placeholder={""}
                    placeholdercolor={secondaryTextColor}
                    value={numOfJobs}
                    onChange={setNumOfJobs}
                />
                <EmptyView height={20} />
                <ThemeTextsecond size={Textstyles.text_small}>Job description</ThemeTextsecond>
                <InputComponentTextarea
                    color={primaryColor}
                    placeholder={"Type it here"}
                    placeholdercolor={secondaryTextColor}
                    onChange={setDescription}
                    value={description}
                />
                <EmptyView height={20} />
                <View className="w-full">
                    <ButtonFunction
                        color={primaryColor}
                        text={"Update"}
                        textcolor={secondaryTextColor}
                        onPress={function (): void {
                            throw new Error("Function not implemented.")
                        }}
                    />

                </View>
     </>
    );
  };
  