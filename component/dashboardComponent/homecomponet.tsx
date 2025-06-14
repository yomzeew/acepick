import { View, ScrollView, TouchableOpacity } from "react-native"
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
import { updateLocation } from "services/userService";
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
      <ContainerTemplate>
        <HeaderComponent />
        <EmptyView height={20} />
        <WalletCard setshowmodal={setshowmodal} showmodal={showmodal} />
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
        <SectorsComponent
          setErrorMessage={setErrorMessage}
        />



      </ContainerTemplate>
    </>
  )
}
export default HomeComp