import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import ButtonFunction from "component/buttonfunction";
import StateandLga, { Modaldisplay } from "component/controls/stateandlga";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { SwitchModalMarket } from "component/switchmode";
import { ThemeText } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator
} from "react-native";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { FilterModalByCategory } from "./filtermodalbyCategory";
import { useMutation } from "@tanstack/react-query";
import { getproductFn } from "services/marketplaceServices";
import { baseUrl } from "utilizes/endpoints";
import { Product } from "type";
import { formatAmount } from "utilizes/amountFormat";

const HomeMarketScreen = () => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme);
  const router = useRouter();

  const [stateLgaModalVisible, setStateLgaModalVisible] = useState(false);
  const [categoryFilterModalVisible, setCategoryFilterModalVisible] = useState(false);
  const [querySummaryModalVisible, setQuerySummaryModalVisible] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [state, setstate] = useState("");
  const [lga, setlga] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);
  const [showOption, setShowOption] = useState(false);
  const [isStateSelection, setIsStateSelection] = useState(true);
  const [data, setData] = useState<string[]>([]);
  const [activePage, setActivePage] = useState("buy");
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [limit, setLimit] = useState(10);
const [page, setPage] = useState(1);

  const productMutation = useMutation({
    mutationFn: getproductFn,
    onSuccess: (response) => {
      setProducts(response.data || []);
      setHasMore(response.data.length === limit); // if less than limit, it’s the last page
      
    },
    onError: (error: any) => {
      console.log("Error fetching products:", error);
    }
  });

  const fetchProducts = () => {
    const queryParts: string[] = [];
  
    if (searchTerm) queryParts.push(`search=${searchTerm}`);
    if (selectedCategoryId) queryParts.push(`categoryId=${selectedCategoryId}`);
    if (state) queryParts.push(`state=${state}`);
    if (lga) queryParts.push(`lga=${lga}`);
    if (limit) queryParts.push(`limit=${limit}`);
    if (page) queryParts.push(`page=${page}`);
  
    const query = queryParts.join("&");
    productMutation.mutate(query || `limit=${limit}&page=${page}`); // fallback if empty
  };
  

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryId, state, lga,limit,page]);

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
    setPage(1); // optionally reset to first page
    await fetchProducts(); // refetch data
    setRefreshing(false);
  };
  
  

  return (
    <>
      {/* Modals */}
      <SliderModalNoScrollview modalHeight="30%" showmodal={categoryFilterModalVisible} setshowmodal={setCategoryFilterModalVisible}>
        <FilterModalByCategory
          showmodal={categoryFilterModalVisible}
          setshowmodal={setCategoryFilterModalVisible}
          setCategory={setSelectedCategoryId}
        />
      </SliderModalNoScrollview>

      <SliderModalNoScrollview showmodal={stateLgaModalVisible} setshowmodal={setStateLgaModalVisible} modalHeight="50%">
        <ContainerTemplate>
          <View className="w-full items-end py-3">
            <TouchableOpacity onPress={() => setStateLgaModalVisible(false)}>
              <FontAwesome5 size={20} color="red" name="times-circle" />
            </TouchableOpacity>
          </View>
          <ThemeText size={Textstyles.text_cmedium}>Set Location</ThemeText>
          <EmptyView height={20} />
          <StateandLga
            state={state}
            lga={lga}
            setstate={setstate}
            setlga={setlga}
            isStateSelection={isStateSelection}
            setIsStateSelection={setIsStateSelection}
            setShowOption={setShowOption}
            showOption={showOption}
            data={data}
            setData={setData}
          />
          <EmptyView height={20} />
          <ButtonFunction
            color={primaryColor}
            text="Apply Location Filter"
            textcolor="#ffffff"
            onPress={() => setStateLgaModalVisible(false)}
          />
        </ContainerTemplate>
      </SliderModalNoScrollview>

      {/* <SliderModalNoScrollview showmodal={querySummaryModalVisible} setshowmodal={setQuerySummaryModalVisible} modalHeight="40%">
  <ContainerTemplate>
    <ThemeText size={Textstyles.text_cmedium}>Query Summary:</ThemeText>
    <EmptyView height={20} />
    <Text>Search: {searchTerm || "-"}</Text>
    <Text>Category ID: {selectedCategoryId ?? "-"}</Text>
    <Text>State: {state || "-"}</Text>
    <Text>LGA: {lga || "-"}</Text>
    <Text>Limit: {limit}</Text>
    <Text>Page: {page}</Text>
  </ContainerTemplate>
</SliderModalNoScrollview> */}

      {/* Main UI */}
      <View className="h-full w-full">
        <ImageBackground source={require('../../assets/walletcard.png')} resizeMode="cover" className="h-1/6 w-full py-3 px-3 relative">
          <View className="h-full justify-end">
            <HeaderComponent title="Market Place" /> 
          </View>
          <TouchableOpacity onPress={()=>router.push('/myItemsLayout')} className="absolute bottom-3 right-3 flex-row">
                <FontAwesome5 size={20} color={primaryColor} name="shopping-cart"/>
            <ThemeText size={Textstyles.text_small}>My items</ThemeText>

            </TouchableOpacity>
        </ImageBackground>

        <ContainerTemplate>
          <EmptyView height={20} />
          <FilterCard
            onSearch={fetchProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <EmptyView height={20} />
          <View className="flex-row flex-wrap gap-3 px-3">
  <TouchableOpacity
    onPress={() => setStateLgaModalVisible(true)}
    style={{ backgroundColor: primaryColor }}
    className="px-2 py-2 rounded-full"
  >
    <Text className="text-white text-xs">Location</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setCategoryFilterModalVisible(true)}
    style={{ backgroundColor: primaryColor }}
    className="px-2 py-2 rounded-full"
  >
    <Text className="text-white text-xs">Category</Text>
  </TouchableOpacity>
{/* 
  <TouchableOpacity
    onPress={() => setQuerySummaryModalVisible(true)}
    style={{ backgroundColor: primaryColor }}
    className="px-2 py-2 rounded-full"
  >
    <Text className="text-white text-xs">Summary</Text>
  </TouchableOpacity> */}

  <TouchableOpacity
    onPress={() => alert("Coming soon")}
    style={{ backgroundColor: primaryColor }}
    className="px-2 py-2 rounded-full"
  >
    <Text className="text-white text-xs">Price Range</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => alert("Coming soon")}
    style={{ backgroundColor: primaryColor }}
    className="px-2 py-2 rounded-full"
  >
    <Text className="text-white text-xs">More Filters</Text>
  </TouchableOpacity>
</View>
<EmptyView height={20} />
          {/* <SwitchModalMarket activePage={activePage} setActivePage={setActivePage} />
          <EmptyView height={20} /> */}

          {productMutation.isPending ? (
            <ActivityIndicator size="large" />
          ) : (
            <View >
                <FlatList
  data={products}
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
            


          
            
          
          )}
<View className="flex-row justify-between px-5 py-3">
  <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
    <Text style={{ color: page === 1 ? 'gray' : primaryColor }}>Previous</Text>
  </TouchableOpacity>

  <TouchableOpacity disabled={!hasMore} onPress={() => setPage(page + 1)}>
    <Text style={{ color: !hasMore ? 'gray' : primaryColor }}>Next</Text>
  </TouchableOpacity>
</View>
        </ContainerTemplate>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/addproductLayout')}
        style={{ backgroundColor: primaryColor }}
        className="absolute bottom-20 right-4 elevation-md shadow-md shadow-slate-500 z-50 w-16 h-16 rounded-full flex-row items-center justify-center"
      >
        <Text style={[Textstyles.text_cmedium]}>+</Text>
        <FontAwesome5 size={20} name="store" />
      </TouchableOpacity>

      {showOption && (
        <Modaldisplay
          data={data}
          isStateSelection={isStateSelection}
          setstate={setstate}
          setlga={setlga}
          setShowOption={setShowOption}
        />
      )}
    </>
  );
};

export default HomeMarketScreen;

interface FilterCardProps {
  onSearch: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const FilterCard = ({  onSearch, searchTerm, setSearchTerm }: FilterCardProps) => {
  const { theme } = useTheme();
  const { selectioncardColor, primaryColor, secondaryTextColor } = getColors(theme);

  return (
    <View style={{ backgroundColor: selectioncardColor, elevation: 4 }} className="w-[95%] self-center rounded-2xl shadow-slate-500 shadow-sm px-5 py-3 ">
  <EmptyView height={10} />
  <View className="flex-row w-full gap-x-3 items-center">
    <View className="relative w-5/6">
      <TouchableOpacity
        onPress={onSearch}
        style={{ backgroundColor: '#033A62' }}
        className="h-12 w-12 z-50 absolute right-0 items-center justify-center rounded-full"
      >
        <FontAwesome5 color="#ffffff" size={20} name="arrow-right" />
      </TouchableOpacity>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search products..."
        placeholderTextColor={primaryColor}
        style={{
          backgroundColor: theme === 'dark' ? '#4F4F4F' : '#e2e8f0',
          color: secondaryTextColor,
          borderColor: theme === 'dark' ? '#4F4F4F' : '#cbd5e1'
        }}
        className="rounded-3xl border h-12 px-3 w-full"
      />
    </View>
  </View>
</View>

  );
};
