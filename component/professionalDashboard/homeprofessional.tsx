import { AntDesign, FontAwesome5 } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonComponent from "component/buttoncomponent"
import CorporateCard from "component/corporatecards"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/dashboardComponent/headercomponent"
import WalletCard from "component/dashboardComponent/walletcompoment"
import EmptyView from "component/emptyview"
import JobAlertScreen from "component/jobs/jobAlertScreen"
import JobCard from "component/jobs/jobsCard"
import SliderModal from "component/SlideUpModal"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useIncomingJob } from "hooks/useIncomingJob"
import { useCurrentLocation } from "hooks/useLocation"
import { useSocket } from "hooks/useSocket"
import { useTheme } from "hooks/useTheme"
import { ReactNode, useEffect, useState } from "react"
import { ImageBackground, Text, TouchableOpacity, View, ScrollView, RefreshControl } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { SaveTokenFunction, updateLocation, walletView } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { JobLatest, Wallet } from "types/type"
import { formatAmount, formatNaira } from "utilizes/amountFormat"

const HomeComponentProfession = () => {
    const router = useRouter()
    const [showmodal, setshowmodal] = useState<boolean>(false)
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false); // 👈 Trigger to re-fetch wallet
    const [refreshing, setRefreshing] = useState(false);
    const fcmToken=useSelector((state:RootState)=>(state?.auth.fcmToken))

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

    const wallet: Wallet | null = useSelector((state: RootState) => state?.auth.user?.wallet) ?? null;
    const [hide, setshowhide] = useState<boolean>(false);
    const [currentBalance, setCurrentBalance] = useState<number>(wallet?.currentBalance || 0);

    const mutationWallet = useMutation({
        mutationFn: walletView,
        onSuccess: async (response) => {
            setCurrentBalance(response.data?.currentBalance || 0);
        },
        onError: (error: any) => {
            console.error("Wallet fetch failed:", error.message);
        },
    });

    useEffect(() => {
        mutationWallet.mutate();
    }, [balanceRefreshTrigger,]); // 👈 Re-fetch on refreshTrigger change



    const handleshow = () => setshowhide(!hide);
    const handleshowfundWallet = () => setshowmodal(!showmodal);

    const user = useSelector((state: RootState) => state.auth?.user) ?? null

    console.log(user)

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
        saveFcmToken()
        updateLocationFn();
    }, [])


    return (
        <>
            {showmodal &&
                <SliderModalTemplate modalHeight={'60%'} showmodal={showmodal} setshowmodal={setshowmodal} >
                    <SlideupContent />
                </SliderModalTemplate>
            }
            <ContainerTemplate>
                <HeaderComponent />
                <EmptyView height={10} />
                <TouchableOpacity onPress={() => setshowmodal(!showmodal)}>
                    <VerificationBadge />
                </TouchableOpacity>
                <View className="flex-1">
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        <EmptyView height={20} />
                        <View style={{ backgroundColor: backgroundColor }} className="h-[70%] w-full">
                            <EmptyView height={10} />
                            <ImageBackground resizeMode="cover" source={require('../../assets/homebg.png')} className="w-full h-full  p-5">
                            <WalletCard 
      setshowmodal={setshowmodal} 
      showmodal={showmodal}  
      refreshTrigger={balanceRefreshTrigger}
      />
                                <EmptyView height={20} />
                                <View className="flex-row justify-around w-full">
                                    <CardRow
                                        numberofjob={user?.profile?.totalJobsCompleted || 0}
                                        icon={
                                            <View className="bg-green-500 w-12 h-12 rounded-2xl justify-center items-center">
                                                <AntDesign size={16} name="checkcircle" color={"#ffffff"} />
                                            </View>
                                        }
                                        description="Jobs Completed"
                                    />
                                    <CardRow
                                        numberofjob={user?.profile?.totalJobsOngoing || 0}
                                        icon={
                                            <View className="bg-blue-400 w-12 h-12 rounded-2xl justify-center items-center">
                                                <AntDesign size={16} name="ellipsis1" color={"#ffffff"} />
                                            </View>
                                        }
                                        description="Jobs in Progress"

                                    />

                                </View>
                                <EmptyView height={20} />
                                <View className="flex-row justify-around w-full">
                                    <CardRow
                                        numberofjob={user?.profile?.totalJobsDeclined || 0}
                                        icon={
                                            <View className="bg-red-500 w-12 h-12 rounded-2xl justify-center items-center">
                                                <FontAwesome5 size={16} name="times" color={"#ffffff"} />
                                            </View>
                                        }
                                        description="Jobs rejected"
                                    />
                                    <CardRow
                                        numberofjob={user?.profile?.totalJobsPending || 0}
                                        icon={
                                            <View className="bg-red-500 w-12 h-12 rounded-2xl justify-center items-center">
                                                <AntDesign size={16} name="warning" color={"#ffffff"} />
                                            </View>
                                        }
                                        description="Jobs pending"
                                    />

                                </View>



                            </ImageBackground>
                            <EmptyView height={10} />

                            <View className="flex-row px-3 justify-between">
                                <ThemeTextsecond size={Textstyles.text_medium}>
                                    Job in Progress
                                </ThemeTextsecond>
                                <TouchableOpacity className="bg-blue-200 py-1 px-2 rounded-2xl justify-center items-center">
                                    <Text>see all</Text>
                                </TouchableOpacity>
                            </View>
                            <EmptyView height={10} />

                            <View className="px-3">
                                <ThemeText size={Textstyles.text_medium}>Earning</ThemeText>
                                <EmptyView height={10} />
                                <View className="flex-row justify-around">
                                    <View className="flex-col">
                                        <View>
                                            <ThemeText size={Textstyles.text_xsmall}>Complete</ThemeText>
                                            <ThemeText size={Textstyles.text_cmedium}>{formatAmount(user?.profile?.professional?.completedAmount || 0)}</ThemeText>
                                        </View>
                                        <View>
                                            <ThemeText size={Textstyles.text_xsmall}>Pending</ThemeText>
                                            <ThemeText size={Textstyles.text_cmedium}>{formatAmount(user?.profile?.professional?.pendingAmount || 0)}</ThemeText>
                                        </View>
                                        <EmptyView height={10} />
                                    </View>
                                    <View className="flex-col">
                                        <View >
                                            <ThemeText size={Textstyles.text_xsmall}>Available for withdraw</ThemeText>
                                            <ThemeText size={Textstyles.text_cmedium}>{formatAmount(user?.profile?.professional?.availableWithdrawalAmount || 0)}</ThemeText>
                                        </View>
                                        <View >
                                            <ThemeText size={Textstyles.text_xsmall}>Rejected</ThemeText>
                                            <ThemeText size={Textstyles.text_cmedium}>{formatAmount(user?.profile?.professional?.rejectedAmount || 0)}</ThemeText>
                                        </View>

                                    </View>

                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </View>

            </ContainerTemplate>

        </>
    )
}
export default HomeComponentProfession

const VerificationBadge = () => {
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    return (
        <>
            <View className="border-red-500 py-3 bg-red-200 gap-x-3 flex-row justify-center  px-3 w-full rounded-2xl h-16 ">
                <View className="w-12 h-12 rounded-full bg-red-500 justify-center items-center">
                    <AntDesign size={12} name="warning" color={"#ffffff"} />
                </View>
                <View className="w-1/2">
                    <Text style={[Textstyles.text_xsmall]}>
                        Please go through the verification phase
                        to be visible to clients for jobs
                    </Text>
                </View>
                <View className="w-1/4 h-full justify-end">
                    <TouchableOpacity style={{ backgroundColor: primaryColor }} className="justify-center items-center px-3 py-2 w-24">
                        <Text>Verify now</Text>
                    </TouchableOpacity>

                </View>



            </View>
        </>
    )
}
interface CardRowProps {
    numberofjob: number;
    icon: ReactNode;
    description: string
}
const CardRow = ({ numberofjob = 0, icon, description }: CardRowProps) => {
    return (
        <>
            <View className="w-36 h-44 rounded-2xl relative">
                <View className="opacity-30 bg-black h-full w-full  absolute" />
                <View className="w-full h-full p-3">
                    {icon}
                    <EmptyView height={10} />
                    <View>
                        <Text className="text-5xl" style={[{ color: "#ffffff" }]}>{numberofjob}</Text>
                    </View>
                    <View>
                        <Text style={[Textstyles.text_xsmall, { color: "#ffffff" }]}>{description}</Text>

                    </View>

                </View>



            </View>
        </>
    )
}

const SlideupContent = () => {
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);
    return (
        <>
            <View className="h-full w-full px-3 items-center justify-center">
                <EmptyView height={60} />
                <View className="w-full flex-1 items-center">

                    <AntDesign name="warning" size={36} color={"red"} />

                </View>
                <EmptyView height={60} />
                <View className="w-full items-center">
                    <ThemeText size={Textstyles.text_small}>
                        <Text className="text-center">
                            Please activate your account to be visible to clients for jobs
                        </Text>

                    </ThemeText>

                </View>
                <EmptyView height={60} />
                <View className="w-full items-center px-3">
                    <ButtonComponent
                        color={primaryColor}
                        text={"Activate Now"}
                        textcolor={"#ffffff"}
                        // route={"/bvnactivationlayout"} 
                        onPress={() => null}
                    />


                </View>

            </View>
        </>
    )
}

function setErrorMessage(msg: string) {
    throw new Error("Function not implemented.")
}
