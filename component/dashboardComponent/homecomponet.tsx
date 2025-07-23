import {
  ScrollView,
  RefreshControl,
  View,
  TouchableOpacity,
  Dimensions
} from "react-native";
import HeaderComponent from "./headercomponent"
import { useTheme } from "../../hooks/useTheme";
import { getColors } from "../../static/color";
import ContainerTemplate from "./containerTemplate";
import WalletCard from "./walletcompoment";
import EmptyView from "../emptyview";
import FilterCard from "./filterCard";
import { ThemeText } from "../ThemeText";
import { Textstyles } from "../../static/textFontsize";
import ProfessionalCard from "./professionalCard";
import { useEffect, useState } from "react";
import SliderModalTemplate, { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { useRouter } from "expo-router";
import JobCard from "component/jobs/jobsCard";
import ListofAPmodal from "./listofA&Pmodal";
import { FontAwesome5 } from "@expo/vector-icons";
import SectorsComponent from "./sectorsComponent";
import { useCurrentLocation } from "hooks/useLocation";
import { useMutation } from "@tanstack/react-query";
import { SaveTokenFunction, updateLocation } from "services/userService";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import PaymentModal from "component/menuComponent/walletPages/paymentModal";
import { AlertMessageBanner } from "component/AlertMessageBanner";

const HomeComp = () => {
  const router = useRouter()
  const [showmodal, setshowmodal] = useState<boolean>(false)
  const [showprofession, setshowprofession] = useState(false)
  const [professionalValue, setProfessionValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorPMessage, setErrorPMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false);
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false); // 👈 Trigger to re-fetch wallet
  const fcmToken=useSelector((state:RootState)=>(state.auth.fcmToken))
  const saveFcmToken=async()=>{
                 try {
                   const response = await SaveTokenFunction(fcmToken);
                   console.log('SaveTokenUrl response:', response.data);
                 } catch (error) {
                   console.error('SaveTokenUrl error:', error);
                 }
    }

  const onRefresh = () => {
    setRefreshing(true);
    // Toggle the trigger for WalletCard
    setBalanceRefreshTrigger(prev => !prev);
    // Add delay to simulate loading
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  


  // const handlenavcategory=(value:string)=>{
  //     router.push(`/category/${value}`)

  // }
  const { location, address, state, lga, loading, error } = useCurrentLocation();

  const mutation = useMutation({
    mutationFn: updateLocation,
    onSuccess: async (response) => {
      //console.log(response,'okkk');
    },
    onError: (error: any) => {
      let msg = "An unexpected error occurred";

      if (error?.response?.data) {
        msg =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        msg = error.message;
      }

      setErrorMessage(msg);
      console.error("failed:", msg);
    },
  });
  const updateLocationFn = () => {
    const { latitude, longitude } = location?.coords ?? {};
    const data = { latitude, longitude, address, state, lga };
    console.log(data)

    mutation.mutate(data); // ✅ Wrap both in one object
  };
  useEffect(() => {
    saveFcmToken();
    updateLocationFn();

  }, [])

  const { height } = Dimensions.get('window');






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
      <ContainerTemplate>
        <HeaderComponent />
        <EmptyView height={20} />
        <View className="flex-1">
        <ScrollView
      refreshControl={
        <RefreshControl 
        refreshing={refreshing} 
        onRefresh={onRefresh}

         />
         
      }
      showsVerticalScrollIndicator={false}
    >
      <WalletCard 
      setshowmodal={setshowmodal} 
      showmodal={showmodal}  
      refreshTrigger={balanceRefreshTrigger}
      />
        <EmptyView height={20} />
        <FilterCard
          showprofession={showprofession}
          setshowprofession={setshowprofession}
          setProfessionValue={setProfessionValue}
          professionalValue={professionalValue}
        />
        <EmptyView height={20} />
        <ThemeText size={Textstyles.text_medium} type="secondary">
          Professional
        </ThemeText>
        <View style={{height:height*0.55}}>
        <SectorsComponent
          setErrorMessage={setErrorMessage}
        />

        </View>
       
      </ScrollView>
        </View>
        



      </ContainerTemplate>
    </>
  )
}
export default HomeComp


