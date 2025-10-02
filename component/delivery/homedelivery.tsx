import { AntDesign, FontAwesome5 } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ButtonComponent from "component/buttoncomponent"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import HeaderComponent from "component/dashboardComponent/headercomponent"
import WalletCard from "component/dashboardComponent/walletcompoment"
import EmptyView from "component/emptyview"
import SliderModalTemplate from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useRouter } from "expo-router"
import { useCurrentLocation } from "hooks/useLocation"
import { useTheme } from "hooks/useTheme"
import { ReactNode, useEffect, useState } from "react"
import { ImageBackground, Text, TouchableOpacity, View, ScrollView, RefreshControl, FlatList,StyleSheet } from "react-native"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { SaveTokenFunction, updateLocation, walletView } from "services/userService"
import { getColors } from "static/color"
import { Textstyles } from "static/textFontsize"
import { DeliveryData, JobLatest, Wallet } from "types/type"
import { formatAmount, formatNaira } from "utilizes/amountFormat"
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { acceptDeliveryFn, pendingdeliveryFn } from "services/deliveryServices"
import SectorSkeletonCard from "component/sectorSkeletonCard"
import * as Location from "expo-location";
import { Modal } from "react-native"

const HomeDelivery = () => {
    const router = useRouter()
    const [showmodal, setshowmodal] = useState<boolean>(false)
   
   
    const { theme } = useTheme(); // Theme state and toggle function
    const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor, selectioncardColor } = getColors(theme);
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(false); // 👈 Trigger to re-fetch wallet
    const [refreshing, setRefreshing] = useState(false);
    const [getId,setgetId]=useState<number>()
    const fcmToken = useSelector((state: RootState) => (state.auth.fcmToken))

    const saveFcmToken = async () => {
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



    const user = useSelector((state: RootState) => state?.auth?.user) ?? null

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
              
                        <View style={{ backgroundColor: backgroundColor }} className="w-full">
                            <EmptyView height={10} />
                            
                                <WalletCard
                                    setshowmodal={setshowmodal}
                                    showmodal={showmodal}
                                    refreshTrigger={balanceRefreshTrigger}
                                />
                                <EmptyView height={20} />
                                <View className="w-full items-center">
                                    <ScrollView showsHorizontalScrollIndicator={false} horizontal>
                                    <View className="flex-row items-center justify-evenly w-full gap-x-3">
                                <View className="bg-green-500  h-16 rounded-2xl justify-center items-center px-3">
                                  <View className="absolute top-0 right-1 "><AntDesign size={16} name="checkcircle" color={"#ffffff"} /></View>
                                  <ThemeText size={Textstyles.text_medium}><Text style={{color:"#fff",fontSize:24}}>{user?.profile?.totalJobsCompleted || 0}</Text></ThemeText>
                                  <ThemeText size={Textstyles.text_xxxsmall}><Text style={{color:"#fff",fontSize:12}}>Completed Order</Text></ThemeText>
                                </View>
                                <View className="bg-orange-500  h-16 rounded-2xl justify-center items-center px-3">
                                  <View className="absolute top-0 right-1 "><AntDesign size={16} name="ellipsis1" color={"#ffffff"} /></View>
                                  <ThemeText size={Textstyles.text_medium}><Text style={{color:"#fff",fontSize:24}}>{user?.profile?.totalJobsOngoing || 0}</Text></ThemeText>
                                  <ThemeText size={Textstyles.text_xxxsmall}><Text style={{color:"#fff",fontSize:12}}>Active Order</Text></ThemeText>
                                </View>
                                <View className="bg-red-500  h-16 rounded-2xl justify-center items-center px-3">
                                  <View className="absolute top-0 right-1 "><FontAwesome5 size={16} name="times" color={"#ffffff"} /></View>
                                  <ThemeText size={Textstyles.text_medium}><Text style={{color:"#fff",fontSize:24}}>{user?.profile?.totalJobsDeclined || 0}</Text></ThemeText>
                                  <ThemeText size={Textstyles.text_xxxsmall}><Text style={{color:"#fff",fontSize:12}}>Cancel Order</Text></ThemeText>
                                </View>
                            </View>

                                    </ScrollView>
                          
                               
                                </View>
                                </View>
                            
                                <EmptyView height={20} />
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

                            <View className="flex-row px-3 justify-between">
                                <ThemeTextsecond size={Textstyles.text_medium}>
                                    Pending Deliveries
                                </ThemeTextsecond>
                            </View>
                            <EmptyView height={10} />
                            <View className="w-full px-3">
                               <CurrentDelivery 
                               balanceRefreshTrigger={balanceRefreshTrigger}

                               />
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
                            </ScrollView>
                            </View>
                           
            </ContainerTemplate>

        </>
    )
}
export default HomeDelivery

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




// Example Props for ShippingCard
interface ShippingCardProps {
    item:DeliveryData
    onPress?: () => void;
    showModal?:boolean
    setShowModal?:(value:boolean)=>void
}

// Map status to colors
const statusColors: Record<string, string> = {
  pending: "#FFA500",
  awaitingPickup: "#1E90FF",
  pickup: "#9370DB",
  onTheWay: "#FFD700",
  delivered: "#32CD32",
  rejected: "#FF0000",
};
  const ShippingCard: React.FC<ShippingCardProps> = ({ item }) => {
    const { theme } = useTheme();
    const { selectioncardColor,backgroundColor } = getColors(theme);
    const [showModal,setShowModal]=useState<boolean>(false)
    const [successMessage,setSuccessMessage]=useState<string | null>("")
    const [errorMessage,setErrorMessage]=useState<string | null>("")
  
    const [pickupAddress, setPickupAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");
  
    const latPickup = item.productTransaction.product.pickupLocation.latitude || 0;
    const lngPickup = item.productTransaction.product.pickupLocation.longitude || 0;
  
    // Replace with real destination lat/lng from your API
    const latDest =  item.dropoffLocation.latitude || 0;
    const lngDest =  item.dropoffLocation.longitude || 0;

    useEffect(() => {
        if (successMessage) {
          const timer = setTimeout(() => {
            setSuccessMessage(null);
          }, 4000);
          return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
      }, [successMessage])

      useEffect(() => {
        if (errorMessage) {
          const timer = setTimeout(() => {
            setErrorMessage(null);
          }, 4000);
          return () => clearTimeout(timer); // Cleanup on unmount or on new error
        }
      }, [errorMessage])
  
    useEffect(() => {
      (async () => {
        try {
          // Ask for permission once
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            console.warn("Permission to access location was denied");
            return;
          }
  
          // Reverse geocode pickup
          const pickup = await Location.reverseGeocodeAsync({
            latitude: latPickup,
            longitude: lngPickup,
          });
          if (pickup.length > 0) {
            setPickupAddress(
              `${pickup[0].name || ""} ${pickup[0].street || ""}, ${pickup[0].city || ""}`
            );
          }
  
          // Reverse geocode destination if exists
          if (latDest && lngDest) {
            const dest = await Location.reverseGeocodeAsync({
              latitude: latDest,
              longitude: lngDest,
            });
            if (dest.length > 0) {
              setDestinationAddress(
                `${dest[0].name || ""} ${dest[0].street || ""}, ${dest[0].city || ""}`
              );
            }
          }
        } catch (error) {
          console.error("Error getting addresses:", error);
        }
      })();
    }, []);
    const mutationAccept=
    useMutation({
        mutationFn: acceptDeliveryFn,
        onSuccess: async (response) => {
            console.log(response.data)
            setSuccessMessage("Order Assigned Successfully")
            setShowModal(false)
        },
        onError: (error: any) => {
            console.error("failed:", error.message);
            setErrorMessage(error.message)
        },
    });


    
    const handleAcceptFn=()=>{
        console.log(item.id)
            mutationAccept.mutate(item.id)
    }
  
    return (
        <>
         <TouchableOpacity
        onPress={()=>setShowModal(true)}
        style={{
          backgroundColor: selectioncardColor,
          padding: 15,
          marginBottom: 10,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 3,
        }}
        className="w-full"
      >
        {/* Order header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <ThemeText size={Textstyles.text_cmedium}>Order #{item.id}</ThemeText>
          <View
            style={{
              backgroundColor: statusColors["pending"],
              paddingVertical: 3,
              paddingHorizontal: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>pending</Text>
          </View>
        </View>
  
        {/* Pickup */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Ionicons name="location-outline" size={16} color="#1E90FF" />
          <ThemeTextsecond>
            {pickupAddress || "Loading pickup address..."}
          </ThemeTextsecond>
        </View>
  
        {/* Destination */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="flag-outline" size={16} color="#32CD32" />
          <ThemeTextsecond>
            {destinationAddress || "Loading destination address..."}
          </ThemeTextsecond>
        </View>
  
        {/* Fare */}
        <ThemeTextsecond>Fare: ₦{item.cost}</ThemeTextsecond>
        <EmptyView height={10}/>

                    {/* Progress Bar for Delivery Status */}
                    <View style={{ height: 6, backgroundColor: "#E0E0E0", borderRadius: 4 }}>
                        <View
                            style={{
                                width: `${getProgressWidth("pending")}%`,
                                height: "100%",
                                backgroundColor: statusColors["pending"],
                                borderRadius: 4,
                            }}
                        />
                    </View>
      </TouchableOpacity>
         <Modal
        animationType="slide"   // or "fade"
        transparent={true}      // makes the background transparent
        visible={showModal}  // show/hide
        onRequestClose={() => { // Android back button handler
          setShowModal(false);
        }}
      >
        <View style={styles.overlay}>
        <View  style={[styles.modalBox,{backgroundColor:backgroundColor}]}>
           
            {errorMessage && (
        <View className="w-full items-center">
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            {errorMessage.toString()}
          </ThemeTextsecond>
        </View>
      )}
      {successMessage && (
         <View className="w-full items-center">
         <ThemeTextsecond size={Textstyles.text_xsmall}>
           {successMessage.toString()}
         </ThemeTextsecond>
       </View>

      )}
<View className="flex-row w-full justify-center gap-x-3">
      <TouchableOpacity onPress={handleAcceptFn} className="bg-blue-500 py-2 px-3 rounded-lg">
                <ThemeTextsecond>
                 <Text className="text-white">Accept</Text>
               </ThemeTextsecond>
                </TouchableOpacity>
          
                <TouchableOpacity 
                onPress={() => 
                {
          setShowModal(false);
        }} 
        className="bg-red-500 py-2 px-3 rounded-lg">
                <ThemeTextsecond>
                 <Text className="text-white">Decline</Text>
               </ThemeTextsecond>
                </TouchableOpacity>

</View>
         
           
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <FontAwesome5 color="red" size={24} name="times-circle"/>
            </TouchableOpacity>

           
         
          </View>
        </View>
      </Modal>
        </>
     
    );
  };

// Helper: map status to progress %
const getProgressWidth = (status: any): any => {
    switch (status) {
        case "pending":
            return 10;
        case "awaitingPickup":
            return 30;
        case "pickup":
            return 50;
        case "onTheWay":
            return 75;
        case "delivered":
            return 100;
        default:
            return 100;
    }
};

interface CurrentDeliveryProps{
    balanceRefreshTrigger:boolean

    
}
const CurrentDelivery = ({ balanceRefreshTrigger }: CurrentDeliveryProps) => {
    const [data, setData] = useState<DeliveryData[]>([]);
    const [refreshing, setRefreshing] = useState(false);
   

    const mutation = useMutation({
        mutationFn: pendingdeliveryFn,
        onSuccess: async (response) => {
            setData(response.data || []);
            
            setRefreshing(false); // stop refresh loader
        },
        onError: (error: any) => {
            console.error("Pending deliveries fetch failed:", error.message);
            setRefreshing(false);
        },
    });
   
    // First load + trigger from parent
    useEffect(() => {
        mutation.mutate();
       
    }, [balanceRefreshTrigger]);

    const onRefresh = () => {
        setRefreshing(true);
        mutation.mutate()
    };

    // Show skeleton while loading and no data
    if (mutation.isPending && data.length === 0) {
        return <SectorSkeletonCard />;
    }



    return (
        <>
        <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ShippingCard  item={item} />}
            refreshControl={
                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            scrollEnabled={false}
            ListEmptyComponent={
                    <ThemeTextsecond>No deliveries found.</ThemeTextsecond> 
            }
        />
        
      
        </>
    );
};


function setErrorMessage(msg: string) {
    throw new Error("Function not implemented.")
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)", // dim background
      justifyContent: "center",
      alignItems: "center",
    },
    modalBox: {
      width: "80%",
      padding: 20,
      borderRadius: 10,
    
    },
    closeButton: {
      right:0,
      position:"absolute"
    },
  });