import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { FilterModalByStatusDelivery } from "component/filtermodalByItems"
import HeaderComponent from "component/headerComp"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { ThemeText, ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { FlatList, RefreshControl, TouchableOpacity, View, ActivityIndicator, Alert, Text, TextInput, Animated, ScrollView } from "react-native"
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
    const [filteredData, setFilteredData] = useState<Delivery[]>([])
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearch, setShowSearch] = useState(false)
    const [selectedTab, setSelectedTab] = useState("all")
    const fadeAnim = new Animated.Value(0)
    const {theme}=useTheme()
    const {primaryColor, backgroundColor, selectioncardColor, secondaryTextColor, backgroundColortwo}=getColors(theme)
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
          if (response.status) {
            setData(response.data || []);
          } else {
            console.error("Orders fetch failed:", response.message || 'Unknown error');
            setErrorMessage("Failed to load orders. Please try again.");
          }
          setRefreshing(false);
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
          case 'paid': return backgroundColortwo;
          case 'accepted': return primaryColor;
          case 'en_route_to_pickup': return primaryColor;
          case 'arrived_at_pickup': return primaryColor;
          case 'picked_up': return primaryColor;
          case 'confirm_pickup': return primaryColor;
          case 'in_transit': return primaryColor;
          case 'arrived_at_dropoff': return primaryColor;
          case 'delivered': return primaryColor;
          case 'confirm_delivery': return primaryColor;
          case 'cancelled': return backgroundColortwo;
          case 'expired': return backgroundColortwo;
          default: return backgroundColortwo;
        }
      }

      const getStatusLabel = (status: string) => {
        switch(status.toLowerCase()) {
          case 'paid': return 'Awaiting Rider';
          case 'accepted': return 'Rider Accepted';
          case 'en_route_to_pickup': return 'En Route to Pickup';
          case 'arrived_at_pickup': return 'At Pickup';
          case 'picked_up': return 'Picked Up';
          case 'confirm_pickup': return 'Pickup Confirmed';
          case 'in_transit': return 'In Transit';
          case 'arrived_at_dropoff': return 'At Dropoff';
          case 'delivered': return 'Delivered';
          case 'confirm_delivery': return 'Completed';
          case 'cancelled': return 'Cancelled';
          case 'expired': return 'Expired';
          default: return status;
        }
      }

      const getStatusIcon = (status: string) => {
        switch(status.toLowerCase()) {
          case 'paid': return 'clock';
          case 'accepted': return 'check-circle';
          case 'en_route_to_pickup': return 'car';
          case 'arrived_at_pickup': return 'map-pin';
          case 'picked_up': return 'package';
          case 'confirm_pickup': return 'check-double';
          case 'in_transit': return 'navigate';
          case 'arrived_at_dropoff': return 'flag';
          case 'delivered': return 'home';
          case 'confirm_delivery': return 'check';
          case 'cancelled': return 'times-circle';
          case 'expired': return 'hourglass-end';
          default: return 'help-circle';
        }
      }

      // Filter data based on search and status
      useEffect(() => {
        let filtered = data;
        
        // Filter by tab
        if (selectedTab !== 'all') {
          filtered = filtered.filter(order => {
            switch(selectedTab) {
              case 'active':
                return ['accepted', 'en_route_to_pickup', 'arrived_at_pickup', 'picked_up', 'confirm_pickup', 'in_transit', 'arrived_at_dropoff'].includes(order.status);
              case 'completed':
                return ['delivered', 'confirm_delivery'].includes(order.status);
              case 'pending':
                return ['paid'].includes(order.status);
              default:
                return true;
            }
          });
        }
        
        // Apply additional status filter if set
        if (statusFilter) {
          filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        // Search filter
        if (searchQuery) {
          filtered = filtered.filter(order => 
            order.id.toString().includes(searchQuery) ||
            order.productTransaction.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.pickupAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setFilteredData(filtered);
      }, [data, statusFilter, searchQuery, selectedTab]);

      const tabs = [
        { key: 'all', label: 'All', count: data.length },
        { key: 'pending', label: 'Pending', count: data.filter(o => o.status === 'paid').length },
        { key: 'active', label: 'Active', count: data.filter(o => ['accepted', 'en_route_to_pickup', 'arrived_at_pickup', 'picked_up', 'confirm_pickup', 'in_transit', 'arrived_at_dropoff'].includes(o.status)).length },
        { key: 'completed', label: 'Completed', count: data.filter(o => ['delivered', 'confirm_delivery'].includes(o.status)).length },
      ];

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
                <View className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <View className="flex-row items-center">
                        <Ionicons name="alert-circle" size={20} color={backgroundColortwo} />
                        <ThemeTextsecond className="text-red-700 text-center ml-2">
                            {errorMessage}
                        </ThemeTextsecond>
                    </View>
                </View>
            )}
            
            {/* Search and Filter Bar */}
            <View className="px-4 mb-4">
                <View className="flex-row items-center gap-3">
                    {/* Search Bar */}
                    <View className="flex-1">
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Ionicons name="search" size={20} color={secondaryTextColor} />
                            <TextInput
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="flex-1 ml-2 text-gray-800"
                                placeholderTextColor="#9ca3af"
                            />
                            {searchQuery ? (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>
                    
                    {/* Filter Button */}
                    <TouchableOpacity 
                        onPress={()=>setFilterModal(true)} 
                        style={{backgroundColor:primaryColor}} 
                        className="items-center justify-center rounded-xl h-12 w-12"
                    >
                        <FontAwesome5 color="#fff" name="filter" size={18}/>
                    </TouchableOpacity>
                </View>
                
                {/* Status Filter Badge */}
                {statusFilter && (
                    <View className="mt-3">
                        <View style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '30', borderWidth: 1 }} className="flex-row items-center rounded-full px-3 py-2 self-start">
                            <Ionicons name="filter" size={14} color={primaryColor} />
                            <ThemeTextsecond className="text-sm text-blue-700 ml-1">
                                Filtered: {getStatusLabel(statusFilter)}
                            </ThemeTextsecond>
                            <TouchableOpacity 
                                onPress={() => setStatusFilter("")}
                                className="ml-2"
                            >
                                <Ionicons name="close" size={16} color={primaryColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
            
            {/* Tabs */}
            <View className="px-4 mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setSelectedTab(tab.key)}
                                style={{ backgroundColor: selectedTab === tab.key ? primaryColor : selectioncardColor }}
                                className="px-4 py-2 rounded-full flex-row items-center"
                            >
                                <ThemeTextsecond 
                                    className={`text-sm font-medium ${
                                        selectedTab === tab.key 
                                            ? 'text-white' 
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </ThemeTextsecond>
                                {tab.count > 0 && (
                                    <View className={`ml-2 px-2 py-0.5 rounded-full ${
                                        selectedTab === tab.key 
                                            ? 'bg-white/20' 
                                            : 'bg-gray-300'
                                    }`}>
                                        <ThemeTextsecond 
                                            className={`text-xs font-semibold ${
                                                selectedTab === tab.key 
                                                    ? 'text-white' 
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            {tab.count}
                                        </ThemeTextsecond>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
            
            <EmptyView height={10}/>
            
            <View className="flex-1">
                {mutation.isPending && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={primaryColor} />
                        <ThemeTextsecond className="mt-4 text-gray-600">Loading orders...</ThemeTextsecond>
                    </View>
                ) : (
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleOrderPress(item)}>
                                <OrderCard item={item} onRefresh={onRefresh} />
                            </TouchableOpacity>
                        )}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                colors={[primaryColor]}
                                tintColor={primaryColor}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom:60}}
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center py-20 px-8">
                                <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                                    <FontAwesome5 
                                        name={searchQuery ? "search" : statusFilter ? "filter" : "box"} 
                                        size={32} 
                                        color={secondaryTextColor} 
                                    />
                                </View>
                                <ThemeTextsecond className="text-center text-gray-600 mb-2">
                                    {searchQuery 
                                        ? 'No orders found matching your search.'
                                        : statusFilter 
                                        ? `No ${getStatusLabel(statusFilter)} orders found.`
                                        : selectedTab !== 'all'
                                        ? `No ${tabs.find(t => t.key === selectedTab)?.label.toLowerCase()} orders.`
                                        : 'No orders found.'
                                    }
                                </ThemeTextsecond>
                                <ThemeTextsecond className="text-center text-gray-400 text-sm mb-4">
                                    {searchQuery 
                                        ? 'Try adjusting your search terms'
                                        : statusFilter 
                                        ? 'Try a different filter'
                                        : 'Your orders will appear here'
                                    }
                                </ThemeTextsecond>
                                {(statusFilter || searchQuery || selectedTab !== 'all') && (
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setStatusFilter("");
                                            setSearchQuery("");
                                            setSelectedTab("all");
                                        }}
                                        style={{ backgroundColor: primaryColor }}
                                        className="px-6 py-3 rounded-xl"
                                    >
                                        <Text className="text-white font-medium">Clear All Filters</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                        ListHeaderComponent={
                            filteredData.length > 0 && (
                                <View className="px-4 pb-4">
                                    <View className="flex-row items-center justify-between">
                                        <ThemeTextsecond className="text-sm text-gray-600">
                                            {filteredData.length} order{filteredData.length !== 1 ? 's' : ''} found
                                        </ThemeTextsecond>
                                        {(searchQuery || statusFilter || selectedTab !== 'all') && (
                                            <TouchableOpacity 
                                                onPress={() => {
                                                    setStatusFilter("");
                                                    setSearchQuery("");
                                                    setSelectedTab("all");
                                                }}
                                            >
                                                <ThemeTextsecond className="text-sm text-blue-500">Clear filters</ThemeTextsecond>
                                            </TouchableOpacity>
                                        )}
                                    </View>
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
