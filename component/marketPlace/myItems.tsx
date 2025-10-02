import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate"
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { SwitchModalMarket } from "component/switchmode";
import { ThemeText } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, TouchableOpacity, View,Text,Image, FlatList, RefreshControl } from "react-native"
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { getBoughtProductFn, getMineProduct, getSoldProductFn, getTransProduct } from "services/marketplaceServices";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { ProductTransaction } from "types/productTransType";
import { Product } from "types/type";
import { formatAmount } from "utilizes/amountFormat";
import { baseUrl } from "utilizes/endpoints";

const MyItems=()=>{
  
  
     const [activePage, setActivePage] = useState("Sold");
  
   
    return(
        <>
         <ImageBackground source={require('../../assets/walletcard.png')} resizeMode="cover" className="h-1/6 w-full py-3 px-3 relative">
          <View className="justify-end">
            <HeaderComponent title="My Items" /> 
          </View>
        </ImageBackground>

        <ContainerTemplate>
            <View className="w-full flex-1">
                <EmptyView height={20}/>
                <SwitchModalMarket activePage={activePage} setActivePage={setActivePage} />
          <EmptyView height={20} />
          {activePage==='Sold'?
          <SoldComponent/>:
          <BoughtComponent/>
          }



            </View>
       
        </ContainerTemplate>
       
        </>
    )
}
export default MyItems

const SoldComponent = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectioncardColor } = getColors(theme);
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  const [productData, setProductData] = useState<ProductTransaction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"" | "all" | "pending" | "ordered" | "delivered">(
    "all"
  );
  const [refreshing, setRefreshing] = useState(false);

  const statuses: Array<"all" | "pending" | "ordered" | "delivered"> = [
    "all",
    "pending",
    "ordered",
    "delivered",
  ];
  
  const statusColors: Record<string, { bg: string; text: string }> = {
    all: { bg: "bg-gray-200", text: "text-gray-700" },
    pending: { bg: "bg-orange-200", text: "text-orange-700" },
    ordered: { bg: "bg-amber-200", text: "text-amber-700" },
    delivered: { bg: "bg-green-200", text: "text-green-700" },
  };

  const mutation = useMutation({
    mutationFn: getSoldProductFn,
    onSuccess: (response) => {
      setProductData(response || []);
      console.log(response, "sold");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load products";
      setErrorMessage(msg);
      setProductData([])
    },
  });

  useEffect(() => {
    mutation.mutate({
      status: status === "all" ? "all" : status, // pass empty string when "all"
    });
  }, [status]);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate({
      status: status === "all" ? "all" : status,
    });
    setRefreshing(false);
  };

  const renderProductCard = ({ item }: { item: ProductTransaction }) => {

    const product = item.product;
    const imageSource =
      Array.isArray(product.images) && product.images.length > 0 && product.images[0]
        ? { uri: `${product.images[0]}` }
        : require("../../assets/homebg.png"); // fallback image

    return (
      <TouchableOpacity
        onPress={() => router.push(`/orderproductdetails?id=${product.id}`)}
        style={{
          backgroundColor: selectioncardColor,
          elevation: 4,
          marginVertical: 5,
        }}
        className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24"
      >
        <View className="absolute w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
          <Text style={[Textstyles.text_xsmall, { color: "red" }]}>
            {String(item.status)}
          </Text>
        </View>

        <Image
          className="w-[45%] h-24 rounded-2xl"
          source={imageSource}
          resizeMode="cover"
        />

        <View className="w-[65%] items-start justify-center px-5">
          <ThemeText size={Textstyles.text_xxxsmall}>{product.name}</ThemeText>
          <Text style={[Textstyles.text_cmedium, { color: "green" }]}>
            {formatAmount(Number(product.price))}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-full flex-1">
      {/* Status filter buttons */}
      <View className="flex-row gap-x-3 items-center justify-center w-full mb-3">
        {statuses.map((s) => {
          const isActive = status === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              className={`px-3 py-1 rounded-xl h-8 ${
                isActive ? "bg-orange-400" : statusColors[s].bg
              }`}
            >
              <Text
                className={`${
                  isActive ? "text-white font-bold" : statusColors[s].text
                }`}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>


      {/* Product list */}
      {errorMessage ? (
        <Text className="text-red-500 text-center">{errorMessage}</Text>
      ) : (
       

           <FlatList
          data={productData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text className="text-center mt-5 text-gray-500">
              No products found
            </Text>
          }
          contentContainerStyle={{paddingBottom:60}}
        />
       
       
      )}
    </View>
  );
};

const BoughtComponent=()=>{
  const router = useRouter();
  const { theme } = useTheme();
  const { selectioncardColor } = getColors(theme);
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  const [productData, setProductData] = useState<ProductTransaction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"" | "all" | "pending" | "ordered" | "delivered">(
    "all"
  );
  const [refreshing, setRefreshing] = useState(false);

  const statuses: Array<"all" | "pending" | "ordered" | "delivered"> = [
    "all",
    "pending",
    "ordered",
    "delivered",
  ];
  
  const statusColors: Record<string, { bg: string; text: string }> = {
    all: { bg: "bg-gray-200", text: "text-gray-700" },
    pending: { bg: "bg-orange-200", text: "text-orange-700" },
    ordered: { bg: "bg-amber-200", text: "text-amber-700" },
    delivered: { bg: "bg-green-200", text: "text-green-700" },
  };

  const mutation = useMutation({
    mutationFn: getBoughtProductFn,
    onSuccess: (response) => {
      setProductData(response || []);
      console.log(response, "sold");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load products";
      setErrorMessage(msg);
      setProductData([])
    },
  });

  useEffect(() => {
    mutation.mutate({
      status: status === "all" ? "all" : status, // pass empty string when "all"
    });
  }, [status]);

  const handleRefresh = () => {
    setRefreshing(true);
    mutation.mutate({
      status: status === "all" ? "all" : status,
    });
    setRefreshing(false);
  };

  const renderProductCard = ({ item }: { item: ProductTransaction }) => {

    const product = item.product;
    const imageSource =
      Array.isArray(product.images) && product.images.length > 0 && product.images[0]
        ? { uri: `${product.images[0]}` }
        : require("../../assets/homebg.png"); // fallback image

    return (
      <TouchableOpacity
        onPress={() => router.push(`/orderproductdetails?id=${product.id}`)}
        style={{
          backgroundColor: selectioncardColor,
          elevation: 4,
          marginVertical: 5,
        }}
        className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24"
      >
        <View className="absolute w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
          <Text style={[Textstyles.text_xsmall, { color: "red" }]}>
            {String(item.status)}
          </Text>
        </View>

        <Image
          className="w-[45%] h-24 rounded-2xl"
          source={imageSource}
          resizeMode="cover"
        />

        <View className="w-[65%] items-start justify-center px-5">
          <ThemeText size={Textstyles.text_xxxsmall}>{product.name}</ThemeText>
          <Text style={[Textstyles.text_cmedium, { color: "green" }]}>
            {formatAmount(Number(product.price))}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="w-full flex-1">
      {/* Status filter buttons */}
      <View className="flex-row gap-x-3 items-center justify-center w-full mb-3">
        {statuses.map((s) => {
          const isActive = status === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              className={`px-3 py-1 rounded-xl h-8 ${
                isActive ? "bg-orange-400" : statusColors[s].bg
              }`}
            >
              <Text
                className={`${
                  isActive ? "text-white font-bold" : statusColors[s].text
                }`}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>


      {/* Product list */}
      {errorMessage ? (
        <Text className="text-red-500 text-center">{errorMessage}</Text>
      ) : (
       

           <FlatList
          data={productData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text className="text-center mt-5 text-gray-500">
              No products found
            </Text>
          }
          contentContainerStyle={{paddingBottom:60}}
        />
       
       
      )}
    </View>
  );
}




// const ProductCard=({item}:{item:Product})=>{
//     const router=useRouter() 
//     const { theme } = useTheme();
//     const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme);

//          const imageSource =
//              Array.isArray(item.images) && item.images.length > 0 && item.images[0]
//                ? { uri: `${item.images[0]}` }
//                : require("../../assets/homebg.png"); // 👈 Your local fallback image
         
//            return (
//        <TouchableOpacity
//          onPress={() => router.push("/productdetailsLayout")}
//          style={{
//            backgroundColor: selectioncardColor,
//            elevation: 4, 
//            marginVertical:5// vertical spacing between cards
//          }}
//          className="rounded-2xl shadow-slate-500 shadow-sm flex-row overflow-hidden items-center w-[100%] h-24 "
//        >
//            <View className="absolute elevation w-24 py-1 bg-orange-100 rounded-l-2xl z-50 top-0 right-0 items-center">
//            <Text style={[Textstyles.text_xsmall, { color: "red" }]}>In Stock</Text>
//            </View>
//                <Image
//                  className="w-[45%]  h-24  rounded-2xl"
//                  source={imageSource}
//                  resizeMode="cover"
//                />
//                <View className="w-[65%] items-center justify-center mt-3">
//                  <View className="flex-row items-center w-full justify-start px-5">
//                    <ThemeText size={Textstyles.text_xxxsmall}>{item.name}</ThemeText>
//                  </View>
//                  <View className="w-full items-start px-5">
//                    <Text style={[Textstyles.text_cmedium, { color: "green" }]}>{formatAmount(Number(item.price))}</Text>
//                  </View>
//                </View>
//              </TouchableOpacity>
//            );
    

// }