import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { SwitchModalMarket } from "component/switchmode";
import { ThemeText } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, TouchableOpacity, View,Text,Image, FlatList } from "react-native"
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { getMineProduct, getTransProduct } from "services/marketplaceServices";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { Product } from "type";
import { formatAmount } from "utilizes/amountFormat";
import { baseUrl } from "utilizes/endpoints";

const MyItems=()=>{
  
  
     const [activePage, setActivePage] = useState("Orders");
  
   
    return(
        <>
         <ImageBackground source={require('../../assets/walletcard.png')} resizeMode="cover" className="h-1/6 w-full py-3 px-3 relative">
          <View className="h-full justify-end">
            <HeaderComponent title="My Items" /> 
          </View>
        </ImageBackground>

        <ContainerTemplate>
            <View className="w-full">
                <EmptyView height={20}/>
                <SwitchModalMarket activePage={activePage} setActivePage={setActivePage} />
          <EmptyView height={20} />
          {activePage==='Orders'?
          <Orders/>:
          <Inventory/>
          }



            </View>
       
        </ContainerTemplate>
       
        </>
    )
}
export default MyItems


const Inventory=()=>{
    const router=useRouter()
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme);
    const [productData, setProductData] = useState<Product[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const userId = useSelector((state: RootState) => state?.auth?.user?.id);
    const [refreshing, setRefreshing] = useState(false);

  
    useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }, [successMessage]);
  
    const mutation = useMutation({
      mutationFn: getMineProduct,
      onSuccess: (response) => {
        console.log('ok')
        setProductData(response.data || []);
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load products";
        setErrorMessage(msg);
      },
    });
  
    useEffect(() => {
      mutation.mutate();
    }, []);
  
    useEffect(() => {
      if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 4000);
        return () => clearTimeout(timer);
      }
    }, [errorMessage]);


  
    if (mutation.isPending) {
      return (
        <ContainerTemplate>
          <View className="justify-center items-center h-full">
            <ActivityIndicator size="large" />
          </View>
        </ContainerTemplate>
      );
    }
    const renderProductCard = ({ item }: { item: Product }) => {
        const imageSource =
          Array.isArray(item.images) && item.images.length > 0 && item.images[0]
            ? { uri: `${baseUrl}${item.images[0]}` }
            : require("../../assets/homebg.png"); // 👈 Your local fallback image
      
        return (
    <TouchableOpacity
      onPress={() => router.push("/productdetailsLayout")}
      style={{
        backgroundColor: selectioncardColor,
        elevation: 4, 
        marginVertical:5// vertical spacing between cards
      }}
      className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24 "
    >
        <View className="absolute elevation w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
        <Text style={[Textstyles.text_xsmall, { color: "red" }]}>In Stock</Text>
        </View>
            <Image
              className="w-[45%]  h-24  rounded-2xl"
              source={imageSource}
              resizeMode="cover"
            />
            <View className="w-[65%] items-center justify-center mt-3">
              <View className="flex-row items-center w-full justify-start px-5">
                <ThemeText size={Textstyles.text_xxxsmall}>{item.name}</ThemeText>
              </View>
              <View className="w-full items-start px-5">
                <Text style={[Textstyles.text_cmedium, { color: "green" }]}>{formatAmount(Number(item.price))}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      };

    const handleRefresh = async () => {
        setRefreshing(true);
       mutation.mutate()
        setRefreshing(false);
      };
    return (
        <>
         <View >
                        <FlatList
          data={productData}
          renderItem={renderProductCard}
          keyExtractor={(item) => `${item.id}`}
          numColumns={1} // Ensures vertical layout
          contentContainerStyle={{
            paddingBottom: 250,
            paddingHorizontal: 8,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
        
                    </View>
        
        </>
    )
}

const Orders = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectioncardColor } = getColors(theme);

  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  const [productData, setProductData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"sold" | "bought">("bought");
  const [refreshing, setRefreshing] = useState(false);

  const mutation = useMutation({
    mutationFn: getTransProduct,
    onSuccess: (response) => {
      setProductData(response.data || []);
      console.log(response.data,'sold')
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load products";
      setErrorMessage(msg);
    },
  });

  useEffect(() => {
    mutation.mutate(status);
  }, [status]);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate(status);
    setRefreshing(false);
  };

  const renderProductCard = ({ item }: { item: any }) => {
    //console.log(item,'ok')
    return (
      <TouchableOpacity
        onPress={() => router.push("/productdetailsLayout")}
        style={{
          backgroundColor: selectioncardColor,
          elevation: 4,
          marginVertical: 5,
        }}
        className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24"
      >
        {item.product.available && (
          <View className="absolute w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
            <Text style={[Textstyles.text_xsmall, { color: "red" }]}>In Stock</Text>
          </View>
        )}
        <View className="w-[65%] items-center justify-center mt-3">
          <View className="w-full items-start px-5">
            <Text style={[Textstyles.text_cmedium, { color: "green" }]}>
              Unit: {formatAmount(Number(item?.product?.price))} × {item?.quantity}
            </Text>
            <Text style={[Textstyles.text_cmedium, { color: "blue" }]}>
              Total: {formatAmount(Number(item.price))}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Filter Buttons */}
      <View className="flex-row justify-around mb-3 px-4 mt-4">
        <TouchableOpacity
          onPress={() => setStatus("bought")}
          className={`justify-center items-center h-10 px-4  rounded-full ${status === "bought" ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <Text className={status === "bought" ? "text-white" : "text-black"}>Bought</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStatus("sold")}
          className={`justify-center items-center h-10 px-4 rounded-full ${status === "sold" ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <Text className={status === "sold" ? "text-white" : "text-black"}>Sold</Text>
        </TouchableOpacity>
        
      </View>
     
      {/* Loader */}
      {mutation.isPending ? (
        <View className="justify-center items-center h-full">
          <ActivityIndicator size="large" />
        </View>
      ) : (
       <View>
          <FlatList
          data={productData}
          renderItem={renderProductCard}
          keyExtractor={(item) => `${item.transaction_id}`}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 250, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

       </View>
      
      )}
      
    </>
  );
}

const ProductCard=({item}:{item:Product})=>{
    const router=useRouter() 
    const { theme } = useTheme();
    const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme);

         const imageSource =
             Array.isArray(item.images) && item.images.length > 0 && item.images[0]
               ? { uri: `${baseUrl}${item.images[0]}` }
               : require("../../assets/homebg.png"); // 👈 Your local fallback image
         
           return (
       <TouchableOpacity
         onPress={() => router.push("/productdetailsLayout")}
         style={{
           backgroundColor: selectioncardColor,
           elevation: 4, 
           marginVertical:5// vertical spacing between cards
         }}
         className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24 "
       >
           <View className="absolute elevation w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
           <Text style={[Textstyles.text_xsmall, { color: "red" }]}>In Stock</Text>
           </View>
               <Image
                 className="w-[45%]  h-24  rounded-2xl"
                 source={imageSource}
                 resizeMode="cover"
               />
               <View className="w-[65%] items-center justify-center mt-3">
                 <View className="flex-row items-center w-full justify-start px-5">
                   <ThemeText size={Textstyles.text_xxxsmall}>{item.name}</ThemeText>
                 </View>
                 <View className="w-full items-start px-5">
                   <Text style={[Textstyles.text_cmedium, { color: "green" }]}>{formatAmount(Number(item.price))}</Text>
                 </View>
               </View>
             </TouchableOpacity>
           );
    

}