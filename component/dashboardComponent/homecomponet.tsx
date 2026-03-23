import {
  ScrollView,
  RefreshControl,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import HeaderComponent from "./headercomponent"
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import ContainerTemplate from "./containerTemplate";
import WalletCard from "./walletcompoment";
import FilterCard from "./filterCard";
import { useEffect, useState } from "react";
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { useRouter } from "expo-router";
import ListofAPmodal from "./listofA&Pmodal";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import SectorsComponent from "./sectorsComponent";
import { useCurrentLocation } from "hooks/useLocation";
import { useMutation } from "@tanstack/react-query";
import { SaveTokenFunction, updateLocation } from "services/userService";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useDashboard } from "hooks/useDashboard";
import PaymentModal from "component/menuComponent/walletPages/paymentModal";
import TransferFund from "component/menuComponent/walletPages/transferfund";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import JobStatistics from "component/jobStatistics";

const SectionHeader = ({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) => {
  const { theme } = useTheme();
  const { secondaryTextColor, primaryColor } = getColors(theme);
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text style={{ fontFamily: 'TTFirsNeueMedium', fontSize: 16, color: secondaryTextColor }}>
        {title}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 13, color: primaryColor }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const HomeComp = () => {
  const router = useRouter()
  const { theme } = useTheme();
  const { selectioncardColor, borderColor, secondaryTextColor, successColor, errorColor } = getColors(theme);
  const [showmodal, setshowmodal] = useState<boolean>(false)
  const [showwithdraw, setshowwithdraw] = useState<boolean>(false)
  const [showprofession, setshowprofession] = useState(false)
  const [professionalValue, setProfessionValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorPMessage, setErrorPMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false);
  const user = useSelector((state: RootState) => state.auth?.user) ?? null;
  const fcmToken = useSelector((state: RootState) => (state.auth.user?.fcmToken))
  const { data: dashboardData, refresh: refreshDashboard } = useDashboard();
  const recentTransactions = (dashboardData as any)?.recentTransactions || [];

  const saveFcmToken = async () => {
    try {
      await SaveTokenFunction(fcmToken);
    } catch (error) {}
  }

  const onRefresh = () => {
    setRefreshing(true);
    setBalanceRefreshTrigger(prev => !prev);
    refreshDashboard();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const { location, address, state, lga } = useCurrentLocation();

  const mutation = useMutation({
    mutationFn: ({ locationId, data }: { locationId: string; data: any }) => updateLocation(locationId, data),
    onSuccess: async () => {},
    onError: (error: any) => {
      let msg = "An unexpected error occurred";
      if (error?.response?.data) {
        msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    },
  });

  const updateLocationFn = () => {
    const locationId = user?.location?.id?.toString();
    if (!locationId) return;
    const { latitude, longitude } = location?.coords ?? {};
    const data = { latitude, longitude, address, state, lga };
    mutation.mutate({ locationId, data });
  };

  useEffect(() => {
    saveFcmToken();
    updateLocationFn();
  }, [])



  return (
    <>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorPMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}
      {showmodal && <SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
        <PaymentModal
          successMessage={successMessage || ''}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorPMessage}
          errorMessage={errorPMessage || ''}
        />
      </SliderModalTemplate>
      }
      {showprofession &&
        <SliderModalNoScrollview
          modalHeight={'80%'}
          showmodal={showprofession}
          setshowmodal={setshowprofession}
        >
          <>
            <View className="w-full items-end px-3 py-3">
              <TouchableOpacity onPress={() => setshowprofession(!showprofession)}>
                <FontAwesome5 name="times-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <ListofAPmodal
              professionalValue={professionalValue}
            />
          </>

        </SliderModalNoScrollview>}
        <SliderModalNoScrollview showmodal={showwithdraw} modalHeight={'80%'} setshowmodal={setshowwithdraw}>
          <TransferFund setshowmodal={setshowwithdraw} />
        </SliderModalNoScrollview>
      <ContainerTemplate>
        <HeaderComponent />
        <View style={{ height: 12 }} />
        
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Wallet Section */}
          <View className="mb-5">
            <WalletCard 
              setshowmodal={setshowmodal} 
              showmodal={showmodal}  
              refreshTrigger={balanceRefreshTrigger}
              setshowwithdraw={setshowwithdraw}
              showwithdraw={showwithdraw}
            />
          </View>
          
          {/* Statistics Section */}
          <View className="mb-5">
            <SectionHeader 
              title="Job Overview" 
              actionText="View All" 
              onAction={() => router.push('/jobstatusLayout/COMPLETED')} 
            />
            <JobStatistics />
          </View>
          
          {/* Search Section */}
          <View className="mb-5">
            <FilterCard
              showprofession={showprofession}
              setshowprofession={setshowprofession}
              setProfessionValue={setProfessionValue}
              professionalValue={professionalValue}
            />
          </View>
          
          {/* Sectors Section */}
          <View className="mb-4">
            <SectionHeader 
              title="Browse Sectors" 
              actionText="See All" 
              onAction={() => router.push('/category/all')} 
            />
            <SectorsComponent
              setErrorMessage={setErrorMessage}
            />
          </View>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <View className="mb-5">
              <SectionHeader
                title="Recent Transactions"
                actionText="View All"
                onAction={() => router.push('/billhistorylayout')}
              />
              <View style={{ backgroundColor: selectioncardColor, borderColor: borderColor, borderWidth: 1 }} className="rounded-2xl p-3">
                {recentTransactions.slice(0, 4).map((txn: any, index: number) => (
                  <View key={txn.id}>
                    <View className="flex-row items-center py-2.5">
                      <View
                        style={{ backgroundColor: (txn.type === 'credit' ? successColor : errorColor) + '20' }}
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      >
                        <Feather
                          name={txn.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
                          size={16}
                          color={txn.type === 'credit' ? successColor : errorColor}
                        />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 13, color: secondaryTextColor }} numberOfLines={1}>
                          {txn.description || (txn.type === 'credit' ? 'Credit' : 'Debit')}
                        </Text>
                        <Text style={{ fontFamily: 'TTFirsNeue', fontSize: 10, color: secondaryTextColor, opacity: 0.6 }}>
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: txn.type === 'credit' ? successColor : errorColor }}>
                        {txn.type === 'credit' ? '+' : '-'}{Number(txn.amount).toLocaleString()}
                      </Text>
                    </View>
                    {index < Math.min(recentTransactions.length, 4) - 1 && (
                      <View style={{ backgroundColor: borderColor, height: 1 }} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </ContainerTemplate>
    </>
  )
}
export default HomeComp


