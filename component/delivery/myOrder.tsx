import { FontAwesome5 } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { FilterModalByStatusDelivery } from "component/filtermodalByItems"
import HeaderComponent from "component/headerComp"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { FlatList, RefreshControl, TouchableOpacity, View, ActivityIndicator, Alert, Text } from "react-native"
import { riderOrdersFn } from "services/deliveryServices"
import { getColors } from "static/color"
import { DeliveryData } from "types/type"
import OrderCard from "./orderCard"
import { Delivery } from "types/orderRider"
import { useSelector } from "react-redux"
import { RootState } from "redux/store"
import { useRouter } from "expo-router"

const MyOrder=()=>{
    const [filterModal,setFilterModal]=useState<boolean>(false)
    const [statusFilter,setStatusFilter]=useState("")
    const [refreshing,setRefreshing]=useState<boolean>(false);
    const [data,setData]=useState<Delivery[]>([])
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const {theme}=useTheme()
    const {primaryColor}=getColors(theme)
    const router = useRouter()
    const user = useSelector((state: RootState) => state.auth.user)
    const userRole = user?.role

    // Check if user should have access to this screen
    useEffect(() => {
        if (userRole !== 'delivery' && userRole !== 'professional') {
            Alert.alert(
                "Access Denied",
                "This screen is only available for delivery partners and professionals.",
                [
                    { text: "OK", onPress: () => router.back() }
                ]
            )
        }
    }, [userRole, router])

    const mutation = useMutation({
        mutationFn: (status?: string) => riderOrdersFn(status),
        onSuccess: async (response) => {
          setData(response.data || []);
          setRefreshing(false);
          setErrorMessage(null);
        },
        onError: (error: any) => {
          console.error("Orders fetch failed:", error.message);
          setRefreshing(false);
          setErrorMessage("Failed to load orders. Please try again.");
        },
      });
      
      // First load
      useEffect(() => {
        if (userRole === 'delivery' || userRole === 'professional') {
          mutation.mutate(statusFilter);
        }
      }, [statusFilter, userRole]); // run again whenever filter changes
      
      const onRefresh = () => {
        setRefreshing(true);
        setErrorMessage(null);
        mutation.mutate(statusFilter);
      }

      const handleOrderPress = (order: Delivery) => {
        // Navigate to order details
        router.push(`/orderdetails/${order.id}`)
      }

      const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
          case 'pending': return '#f59e0b';
          case 'in-progress': return '#3b82f6';
          case 'completed': return '#10b981';
          case 'cancelled': return '#ef4444';
          default: return '#6b7280';
        }
      }

    return(
        <>
        <SliderModalNoScrollview
                  modalHeight="30%"
                  showmodal={filterModal}
                  setshowmodal={setFilterModal}
                >
                  <FilterModalByStatusDelivery
                    showmodal={filterModal}
                    setshowmodal={setFilterModal}
                    setStatus={setStatusFilter}
                  />
                </SliderModalNoScrollview>
        <ContainerTemplate>
            <HeaderComponent title="My Orders" />
            <EmptyView height={20} />
            
            {/* Error Message */}
            {errorMessage && (
                <View className="mx-4 mb-4 p-3 bg-red-100 rounded-lg">
                    <ThemeTextsecond className="text-red-700 text-center">
                        {errorMessage}
                    </ThemeTextsecond>
                </View>
            )}
            
            {/* Filter Button */}
            <View className="items-end w-full px-3">
                <TouchableOpacity 
                    onPress={()=>setFilterModal(true)} 
                    style={{backgroundColor:primaryColor}} 
                    className="items-center justify-center rounded-full h-12 w-12"
                >
                    <FontAwesome5 color="#fff" name="filter"/>
                </TouchableOpacity>
            </View>
            
            {/* Status Filter Badge */}
            {statusFilter && (
                <View className="mx-4 mb-2">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1 self-start">
                        <ThemeTextsecond className="text-sm">
                            Filtered: {statusFilter}
                        </ThemeTextsecond>
                        <TouchableOpacity 
                            onPress={() => setStatusFilter("")}
                            className="ml-2"
                        >
                            <FontAwesome5 name="times" size={12} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
            <EmptyView height={10}/>
            
            <View className="flex-1">
                {mutation.isPending && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={primaryColor} />
                        <ThemeTextsecond className="mt-4">Loading orders...</ThemeTextsecond>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleOrderPress(item)}>
                                <OrderCard item={item} onRefresh={onRefresh} />
                            </TouchableOpacity>
                        )}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom:60}}
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center py-20">
                                <FontAwesome5 name="box" size={48} color="#9ca3af" />
                                <ThemeTextsecond className="mt-4 text-center">
                                    {statusFilter ? `No ${statusFilter} orders found.` : 'No orders found.'}
                                </ThemeTextsecond>
                                {statusFilter && (
                                    <TouchableOpacity 
                                        onPress={() => setStatusFilter("")}
                                        className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
                                    >
                                        <Text className="text-white text-sm">Clear Filter</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                        ListHeaderComponent={
                            data.length > 0 && (
                                <View className="px-4 pb-2">
                                    <ThemeTextsecond className="text-sm text-gray-600">
                                        {data.length} order{data.length !== 1 ? 's' : ''} found
                                    </ThemeTextsecond>
                                </View>
                            )
                        }
                    />
                )}
            </View>
        </ContainerTemplate>

        </>
    )
}
export default MyOrder
