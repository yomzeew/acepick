import { useMutation } from "@tanstack/react-query";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText } from "component/ThemeText";
import { useRouter } from "expo-router";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { getMineProduct } from "services/marketplaceServices";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { Product } from "type";

const MineProduct = () => {
  const router = useRouter();
  const [productData, setProductData] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

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

  return (
    <ContainerTemplate>
      <HeaderComponent title={"My Items"} />
      <EmptyView height={20} />
      {productData.length === 0 ? (
        <View className="h-full w-full items-center justify-center">
          <Text>No products found.</Text>
        </View>
      ) : (
        <ScrollView>
          <View className="items-center justify-center flex-row flex-wrap gap-3 w-full px-2 pb-20">
            {productData.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </ScrollView>
      )}
    </ContainerTemplate>
  );
};

export default MineProduct;
type ProductCardProps = {
    product: Product;
  };
  
  const ProductCard = ({ product }: ProductCardProps) => {
    const router = useRouter();
    const { theme } = useTheme();
    const { selectioncardColor } = getColors(theme);
  
    const imageUrl = product.images?.[0]
      ? { uri: product.images[0] }
      : require("../../assets/fallback-product.png"); // fallback image
  
    const price = `N${parseFloat(product.price).toLocaleString()}`;
    const isOutOfStock = product.quantity === 0;
  
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/productdetailsLayout",
            params: { productId: product.id },
          })
        }
        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
        className="w-[45%] h-64 rounded-2xl shadow-slate-500 shadow-sm px-3 py-4"
      >
        <View className="w-full items-center justify-center">
          <Image
            className="w-20 h-20 rounded-md"
            source={imageUrl}
            resizeMode="cover"
          />
          <EmptyView height={10} />
          <ThemeText  size={Textstyles.text_xxxsmall}>
            <Text numberOfLines={1}>
            {product.name}
            </Text>
          </ThemeText>
          <EmptyView height={5} />
          <View className="w-full items-start">
            <Text style={[Textstyles.text_cmedium, { color: "green" }]}>
              {price}
            </Text>
          </View>
          <EmptyView height={5} />
          <View className="w-full items-start">
            <Text
              style={[
                Textstyles.text_cmedium,
                { color: isOutOfStock ? "red" : "gray" },
              ]}
            >
              {isOutOfStock ? "Sold Out" : `${product.quantity} in stock`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  