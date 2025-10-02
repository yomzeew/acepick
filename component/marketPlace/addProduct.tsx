import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import ButtonComponent from "component/buttoncomponent";
import Checkbox from "component/controls/checkbox";
import InputComponent from "component/controls/textinput";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import SelectComponent from "component/dashboardComponent/selectComponent";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View, Image, Platform } from "react-native";
import { addproductFn, getCategories, uploadProduct } from "services/marketplaceServices";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { Category, categoryProduct } from "types/type";
import * as ImagePicker from "expo-image-picker";
import { baseUrl } from "utilizes/endpoints";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { Ionicons } from "@expo/vector-icons";

const Addproduct = () => {
  const [category, setCategory] = useState<string>("");
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [autoGenerate, setAutoGenerate] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
  const userId=useSelector((state:RootState)=>(state?.auth?.user?.id))

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer); // Cleanup on unmount or on new error
    }
  }, [successMessage])
  

  const categoryMutation = useMutation({
    mutationFn: getCategories,
    onSuccess: (response) => {
      setCategoryData(response || []);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to load categories";
      setErrorMessage(msg);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProduct,
    onSuccess: (response) => {
      const uploadedUrl = response.data?.urls;
      console.log(uploadedUrl)
      if (uploadedUrl && Array.isArray(uploadedUrl)) {
        setImages((prev) => [...prev, ...uploadedUrl]);
      }
    },
    onError: (error: any) => {
      let msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Image upload failed";

    if (msg.includes("Network Error") && Platform.OS === "android") {
      msg = "Check your connection or try a different image.";
    }
    setErrorMessage(msg);
    },
  });

  const mutationAdd = useMutation({
    mutationFn: addproductFn,
    onSuccess: () => {
      setSuccessMessage("Product added successfully!");
      setImages([]);
      setCategory('')
      setDescription('')
      setName('')
      setQuantity('')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to add product";
      setErrorMessage(msg);
    },
  });

  useEffect(() => {
    categoryMutation.mutate();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = () => {
    const selectedCategory = categoryData.find((item) => item.name === category);

    const payload = {
      name,
      description,
      categoryId: selectedCategory?.id || null,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      discount: 0,
      userId, 
      locationId: 1,
      images,
    };
    console.log(payload)


    mutationAdd.mutate(payload);
  };

  const onUpload = async () => {
    if (images.length >= 5) {
      setErrorMessage("You can only upload a maximum of 5 images.");
      return;
    }
  
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      setErrorMessage("Please allow media library access.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 5 - images.length, // Allow only up to remaining slots
    });
  
    if (result.canceled || !result.assets || result.assets.length === 0) return;
  
    const newUploads = result.assets.slice(0, 5 - images.length);
  
    const formData = new FormData();
    newUploads.forEach((image, index) => {
      let uri = image.uri;
      if (Platform.OS === "android" && !uri.startsWith("file://")) {
        uri = `file://${uri}`;
      }
    
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;
    
      formData.append("product", {
        uri,
        name: `product_${Date.now()}_${index}.${fileExt}`,
        type: mimeType,
      } as any);
    });
      uploadMutation.mutate(formData)
    setSuccessMessage("Image(s) uploaded successfully.");
  };
  

  const categoryList = categoryData.map((item) => item.name);

  if (categoryMutation.isPending) {
    return (
      <ContainerTemplate>
        <View className="justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </ContainerTemplate>
    );
  }

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}

      <ContainerTemplate>
        <HeaderComponent title="Add Product" />
        <EmptyView height={20} />
        <View className="h-full w-full">
          <ScrollView contentContainerStyle={{paddingBottom:60}} className="px-4 space-y-4">
            <ThemeText size={Textstyles.text_xsmall}>Category</ThemeText>
            <SelectComponent 
            title="e.g. Electronics, Fashion" 
            width="100%" 
            data={categoryList} 
            setValue={setCategory} 
            value={category} 
            />

            <EmptyView height={10} />
            <ThemeText size={Textstyles.text_xsmall}>Product Name</ThemeText>
            <InputComponent 
            placeholder="Enter product name" 
            color={primaryColor} 
            placeholdercolor={secondaryTextColor} 
            value={name} 
            onChange={setName} 
            />

            <EmptyView height={10} />
            <ThemeText size={Textstyles.text_xsmall}>Description</ThemeText>
            <InputComponent 
            placeholder="Enter Description" 
            color={primaryColor} 
            placeholdercolor={secondaryTextColor} 
            value={description} 
            onChange={setDescription}
             multiline 
             />

            <EmptyView height={10} />
            <View className="flex-row gap-x-2 items-center justify-end">
              <Checkbox isChecked={autoGenerate} onToggle={setAutoGenerate} />
              <ThemeText size={Textstyles.text_xsmall}>AI auto generated</ThemeText>
            </View>

            <EmptyView height={10} />
            <ThemeText size={Textstyles.text_xsmall}>Amount (₦)</ThemeText>
            <InputComponent 
            placeholder="Enter amount" 
            color={primaryColor} 
            placeholdercolor={secondaryTextColor} 
            keyboardType="numeric" 
            value={price} 
            onChange={setPrice} 
            />

            <EmptyView height={10} />
            <ThemeText size={Textstyles.text_xsmall}>Stock Quantity</ThemeText>
            <InputComponent 
            placeholder="Enter available stock" 
            color={primaryColor} 
            placeholdercolor={secondaryTextColor} 
            keyboardType="numeric" 
            value={quantity} 
            onChange={setQuantity}
             />

            <EmptyView height={10} />
            <ThemeText size={Textstyles.text_xsmall}>Upload Product Images</ThemeText>
            <TouchableOpacity
            
  onPress={onUpload}
  disabled={images.length >= 5}
  style={{
    backgroundColor: selectioncardColor,
    opacity: images.length >= 5 ? 0.5 : 1,
  }}
  className="h-16 items-center justify-center rounded-xl"
>
 {uploadMutation.isPending?
 <ActivityIndicator size="small"/>:
<ThemeTextsecond size={Textstyles.text_xsmall}>
    {images.length >= 5 ? "Max 5 images reached" : "Upload Images"}
  </ThemeTextsecond>}
</TouchableOpacity>

            <EmptyView height={10} />
            <View className="flex-row flex-wrap gap-2">
  {images.map((url, index) => (
    <View key={index} className="relative">
      <Image
        source={{ uri:url }}
        className="h-12 w-12 rounded-xl"
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => {
          setImages((prev) => prev.filter((_, i) => i !== index));
        }}
        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
      >
        <Ionicons name="close" size={12} color="#fff" />
      </TouchableOpacity>
    </View>
  ))}
</View>

            <EmptyView height={20} />
            <ButtonComponent color={primaryColor} text="Submit Product" textcolor="#fff" onPress={handleSubmit} />
          </ScrollView>
        </View>
      </ContainerTemplate>
    </>
  );
};

export default Addproduct;
