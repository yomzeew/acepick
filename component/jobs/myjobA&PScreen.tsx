import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import { useEffect, useState } from 'react';
  import { useMutation } from '@tanstack/react-query';
  import { AntDesign } from '@expo/vector-icons';
  import { useRouter } from 'expo-router';
  
  import HeaderComponent from 'component/headerComp';
  import ContainerTemplate from 'component/dashboardComponent/containerTemplate';
  import EmptyView from 'component/emptyview';
  import SectorSkeletonCard from 'component/sectorSkeletonCard';
  import JobStatusBar from 'component/jobStatusBar';
  import { FilterModalByStatus } from 'component/filtermodalByItems';
  import { SliderModalNoScrollview } from 'component/slideupModalTemplate';
  import JobAlertScreen from './jobAlertScreen';
  import ButtonComponent from 'component/buttoncomponent';
  import { AlertMessageBanner } from 'component/AlertMessageBanner';
  import ClientDetails, {
    ClientDetailsForProf,
  } from 'component/dashboardComponent/clientdetail';
  
  import { getColors } from 'static/color';
  import { Textstyles } from 'static/textFontsize';
  import { ThemeText, ThemeTextsecond } from 'component/ThemeText';
  import { MyJob } from 'type';
  import { useTheme } from 'hooks/useTheme';
  import { useIncomingJob } from 'hooks/useIncomingJob';
  import {
    completeJobFn,
    getAllJobs,
  } from 'services/userService';
  
  
  const MyAPjobScreen = () => {
    const { theme } = useTheme();
    const { primaryColor } = getColors(theme);
  
    /* ────────────────────────────── local state */
    const [data, setData]                       = useState<MyJob[]>([]);
    const [statusFilter, setStatusFilter]       = useState<string>('');
    const [refreshing, setRefreshing]           = useState(false);
    const [showFilter, setShowFilter]           = useState(false);
  
    const [showAlert, setShowAlert]             = useState(false); // socket alert
    const { job }                               = useIncomingJob();
  
    const [showEndJob, setShowEndJob]           = useState(false);
    const [selectedJobId, setSelectedJobId]     = useState<number | null>(null);
  
    /* ────────────────────────────── fetch jobs   */
    //  useEffect(() => {
    //       if (banner) {
    //         const timer = setTimeout(() => {
    //           setBanner(null);
    //         }, 4000); // 4 seconds
        
    //         return () => clearTimeout(timer); // cleanup if banner changes quickly
    //       }
    //     }, [banner]);

    const jobsMutation = useMutation({
      mutationFn: getAllJobs,
      onSuccess: (res) => setData(res.data),
      onSettled: () => setRefreshing(false),
    });
  
    /** helper so we don’t duplicate query‑string logic */
    const refetchJobs = () => {
      setRefreshing(true);
      const qs = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : null;
      jobsMutation.mutate(qs);
    };
  
    /* first load + whenever filter changes */
    useEffect(() => {
      refetchJobs();
      // eslint‑disable‑next‑line react‑hooks/exhaustive‑deps
    }, [statusFilter]);
  
    /* socket alert modal */
    useEffect(() => {
      if (job) setShowAlert(true);
    }, [job]);
  
    /* ----------------------------------------------------------- */
    return (
      <>
        {/* ───── Filter modal ───── */}
        <SliderModalNoScrollview
          showmodal={showFilter}
          setshowmodal={setShowFilter}
          modalHeight="30%"
        >
          <FilterModalByStatus
            showmodal={showFilter}
            setshowmodal={setShowFilter}
            setStatus={setStatusFilter}
          />
        </SliderModalNoScrollview>
  
        {/* ───── Main content ───── */}
        <ContainerTemplate>
          <HeaderComponent title="My Jobs" />
  
          {/* filter button */}
          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            style={{
              position: 'absolute',
              right: 12,
              top: 90,
              backgroundColor: primaryColor,
            }}
            className="p-2 rounded-full"
          >
            <AntDesign name="filter" size={24} color="#fff" />
          </TouchableOpacity>
  
          <View className="flex-1 pt-5 pb-5">
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refetchJobs}
                />
              }
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
            >
              {/* skeleton while first load */}
              {jobsMutation.isPending && !refreshing ? (
                [...Array(4)].map((_, i) => <SectorSkeletonCard key={i} />)
              ) : data.length ? (
                data.map((jobItem) => (
                  <JobCard
                    key={jobItem.id}
                    item={jobItem}
                    onEndJobPress={() => {
                      setSelectedJobId(jobItem.id);
                      setShowEndJob(true);
                    }}
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
  
        {/* socket alert modal */}
        {showAlert && job && (
          <JobAlertScreen
            item={job}
            showalertModal={showAlert}
            setshowalertModal={setShowAlert}
          />
        )}
  
        {/* confirm‑end‑job modal */}
        <SliderModalNoScrollview
          showmodal={showEndJob}
          setshowmodal={setShowEndJob}
          modalHeight="55%"
        >
          {selectedJobId && (
            <ConfirmEndJob
              jobId={selectedJobId}
              onClose={() => setShowEndJob(false)}
              onSuccess={refetchJobs}
            />
          )}
        </SliderModalNoScrollview>
      </>
    );
  };
  
  export default MyAPjobScreen;
  
  
  interface JobCardProps {
    item: MyJob;
    onEndJobPress: () => void;
  }
  
  const JobCard = ({ item, onEndJobPress }: JobCardProps) => {
    const router                         = useRouter();
    const { theme }                      = useTheme();
    const { selectioncardColor, primaryColor } = getColors(theme);
  
    /** button that depends on invoice existence */
    const invoiceBtn = item.workmanship ? (
      <TouchableOpacity
        onPress={() =>
          router.push(`/invoiceViewPageLayout?jobId=${item.id}`)
        }
        className="items-center justify-center px-3 h-10 rounded-xl bg-orange-400"
      >
        <Text style={{ color: '#fff' }}>View Invoice</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={() => router.push(`/invoiceLayout?jobId=${item.id}`)}
        className="items-center justify-center px-3 h-10 rounded-xl"
        style={{ backgroundColor: primaryColor }}
      >
        <Text style={{ color: '#fff' }}>Generate Invoice</Text>
      </TouchableOpacity>
    );
  
    /* show “End Job” only when job is ONGOING */
    const endJobBtn =
      item.status === 'ONGOING' ? (
        <TouchableOpacity
          onPress={onEndJobPress}
          className="items-center justify-center px-3 h-10 rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Text style={{ color: '#fff' }}>End&nbsp;Job</Text>
        </TouchableOpacity>
      ) : null;
  
    return (
      <View
        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
        className="rounded-xl p-4 mb-4"
      >
        <JobStatusBar status={item.status} />
  
        <ThemeText size={Textstyles.text_small}>{item.title}</ThemeText>
  
        <EmptyView height={20} />
        <ClientDetailsForProf clientId={item.clientId} />
        <EmptyView height={20} />
  
        <ThemeTextsecond size={Textstyles.text_xsma}>
          {item.description}
        </ThemeTextsecond>
  
        <EmptyView height={20} />
  
        {item.status !== 'REJECTED' && (
          <View className="flex-row w-full justify-between">
            {invoiceBtn}
            {endJobBtn}
          </View>
        )}
      </View>
    );
  };
  
  
  const ConfirmEndJob = ({
    jobId,
    onClose,
    onSuccess,
  }: {
    jobId: number;
    onClose: () => void;
    onSuccess: () => void;
  }) => {
    const { theme }              = useTheme();
    const { primaryColor }       = getColors(theme);
  
    const [message, setMessage]  = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
    const completeMutation = useMutation({
      mutationFn: completeJobFn,
      onSuccess: () => {
        setMessage({ type: 'success', text: 'Job marked as completed.' });
        onSuccess();        // refresh list
        onClose();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.error ??
          err?.message ??
          'An unexpected error occurred';
          setMessage({ type: 'error', text: msg });
      },
    });
  
    const handleConfirm = () => completeMutation.mutate(jobId);
  
    return (
      <View className="flex-1 px-6 justify-center items-center">
        {message && (
          <AlertMessageBanner type={message.type} message={message.text} />
        )}
  
        <ThemeText size={Textstyles.text_medium}>Confirm completion</ThemeText>
        <EmptyView height={10} />
        <ThemeTextsecond size={Textstyles.text_xsma}>
          Are you sure you’ve finished this job and wish to mark it as completed?
        </ThemeTextsecond>
  
        <EmptyView height={30} />
  
        <ButtonComponent
          color={primaryColor}
          text={completeMutation.isPending ? 'Submitting…' : 'Mark Job Done'}
          textcolor="#fff"
          onPress={handleConfirm}
          disabled={completeMutation.isPending}
        />
  
        <EmptyView height={15} />
  
        <ButtonComponent
          color="#aaa"
          text="Cancel"
          textcolor="#000"
          onPress={onClose}
        />
      </View>
    );
  };
  