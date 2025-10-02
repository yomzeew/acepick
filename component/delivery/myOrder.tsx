import { FontAwesome5 } from "@expo/vector-icons"
import { useMutation } from "@tanstack/react-query"
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview"
import { FilterModalByStatusDelivery } from "component/filtermodalByItems"
import HeaderComponent from "component/headerComp"
import { SliderModalNoScrollview } from "component/slideupModalTemplate"
import { ThemeTextsecond } from "component/ThemeText"
import { useTheme } from "hooks/useTheme"
import { useEffect, useState } from "react"
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native"
import { riderOrdersFn } from "services/deliveryServices"
import { getColors } from "static/color"
import { DeliveryData } from "types/type"
import OrderCard from "./orderCard"
import { Delivery } from "types/orderRider"

const MyOrder=()=>{
    const [filterModal,setFilterModal]=useState<boolean>(false)
    const [statusFilter,setStatusFilter]=useState("")
    const [refreshing,setRefreshing]=useState<boolean>(false);
    const [data,setData]=useState<Delivery[]>([])
    const {theme}=useTheme()
    const {primaryColor}=getColors(theme)

    const mutation = useMutation({
        mutationFn: (status?: string) => riderOrdersFn(status),
        onSuccess: async (response) => {
          setData(response.data || []);
          setRefreshing(false);
        },
        onError: (error: any) => {
          console.error("Pending deliveries fetch failed:", error.message);
          setRefreshing(false);
        },
      });
      
      // First load
      useEffect(() => {
        mutation.mutate(statusFilter);
      }, [statusFilter]); // run again whenever filter changes
      
      const onRefresh = () => {
        setRefreshing(true);
        mutation.mutate(statusFilter);
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
                        <View className="items-end w-full px-3">
                            <TouchableOpacity onPress={()=>setFilterModal(true)} style={{backgroundColor:primaryColor}} className="items-center justify-center rounded-full h-12 w-12">
                            <FontAwesome5 color="#fff" name="filter"/>
                            </TouchableOpacity>
                        </View>
                        <EmptyView height={10}/>
                        <View className="flex-1 ">
                             <FlatList
                                        data={data}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => <OrderCard item={item} onRefresh={onRefresh} />}
                                        refreshControl={
                                             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                        }
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{paddingBottom:60}}
                                        ListEmptyComponent={
                                                <ThemeTextsecond>No deliveries found.</ThemeTextsecond> 
                                        }
                                    />

                        </View>

            
        </ContainerTemplate>

        </>
    )
}
export default MyOrder
