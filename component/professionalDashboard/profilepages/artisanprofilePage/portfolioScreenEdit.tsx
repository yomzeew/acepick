import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "context/ToastContext";
import ButtonFunction from "component/buttonfunction";
import InputComponent, { InputComponentTextarea } from "component/controls/textinput";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import ConfirmModal from "component/deleteConfirmModal";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import SliderModalTemplate from "component/slideupModalTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Image, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { portfoliosCreateFn, portfoliosDeleteFn, portfoliosGetFn, portfoliosUpdateFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import * as ImagePicker from "expo-image-picker";
import { uploadPortfolioImagesToLocal } from "services/localUploadService";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";

const PortfolioScreenEdit = () => {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);

  const [showSlideUp, setShowSlideUp] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleShowSlide = () => {
    setEditData(null);
    setShowSlideUp(true);
  };

  const refreshList = () => setRefreshFlag((prev) => !prev);

  return (
    <>
      {showSlideUp && (
        <SliderModalTemplate showmodal={showSlideUp} modalHeight={"90%"} setshowmodal={setShowSlideUp}>
          <AddPortfolio
            setShowSlideUp={setShowSlideUp}
            existingData={editData}
            setEditData={setEditData}
            refreshList={refreshList}
          />
        </SliderModalTemplate>
      )}
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Portfolio"} />
          <View className="w-full flex-row justify-between items-center px-1" style={{ marginTop: 8 }}>
            <ThemeTextsecond size={Textstyles.text_c}>Showcase your best work</ThemeTextsecond>
            <TouchableOpacity
              onPress={handleShowSlide}
              className="flex-row items-center rounded-full px-4 py-2"
              style={{ backgroundColor: primaryColor, gap: 6 }}
            >
              <FontAwesome5 name="plus" size={12} color="#ffffff" />
              <Text style={[Textstyles.text_xxxsmall, { color: '#ffffff' }]}>Add New</Text>
            </TouchableOpacity>
          </View>
          <EmptyView height={16} />
          <PortfolioList
            setShowSlideUp={setShowSlideUp}
            setEditData={setEditData}
            refreshFlag={refreshFlag}
          />
        </View>
      </ContainerTemplate>
    </>
  );
};
export default PortfolioScreenEdit;

interface AddPortfolioProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  existingData: any;
  refreshList: () => void;
}

const AddPortfolio = ({ setShowSlideUp, existingData, setEditData, refreshList }: AddPortfolioProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (existingData) {
      setTitle(existingData?.title || "");
      setDescription(existingData?.description || "");
      setDuration(existingData?.duration || "");
      setDate(existingData?.date || "");
      setImageUri(existingData?.file || "");
    }
  }, [existingData]);

  const addMutation = useMutation({
    mutationFn: portfoliosCreateFn,
    onSuccess: () => {
      toast.success("Portfolio item added successfully.");
      setShowSlideUp(false);
      setEditData(null);
      refreshList();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: portfoliosUpdateFn,
    onSuccess: () => {
      toast.success("Portfolio item updated successfully.");
      setShowSlideUp(false);
      setEditData(null);
      refreshList();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      toast.error(msg);
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Project title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (description.length > 120) newErrors.description = "Description must be 120 characters or less";
    if (!duration.trim()) newErrors.duration = "Duration is required";
    if (!date) newErrors.date = "Project date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        try {
          const urls = await uploadPortfolioImagesToLocal([result.assets[0].uri], userId || "unknown");
          if (urls && urls.length > 0) {
            setImageUri(urls[0]);
          }
        } catch (err) {
          toast.error("Image upload failed");
        } finally {
          setIsUploading(false);
        }
      }
    } catch {
      toast.error("Failed to pick image");
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = { title, description, duration, date, file: imageUri || "" };

    if (existingData?.id) {
      updateMutation.mutate({ id: existingData.id, payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <ScrollView className="w-full" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
      <View className="items-center mb-6">
        <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: primaryColor + "20" }}>
          <FontAwesome5 name="image" size={20} color={primaryColor} />
        </View>
        <ThemeText size={Textstyles.text_small}>
          {existingData ? "Edit Portfolio" : "Add Portfolio"}
        </ThemeText>
        <View className="items-center mt-1">
          <ThemeTextsecond size={Textstyles.text_c}>
            {existingData ? "Update your portfolio project" : "Showcase your best work"}
          </ThemeTextsecond>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="heading" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Project Title</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Enter project title"}
            placeholdercolor={secondaryTextColor}
            value={title}
            onChange={(v: string) => { setTitle(v); setErrors((p) => ({ ...p, title: "" })); }}
          />
          {errors.title && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.title}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="align-left" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Description</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Describe your project and achievements"}
            placeholdercolor={secondaryTextColor}
            value={description}
            onChange={(v: string) => { setDescription(v); setErrors((p) => ({ ...p, description: "" })); }}
          />
          <View className="w-full items-end mt-1">
            <ThemeTextsecond size={Textstyles.text_c}>{description.length}/300 characters</ThemeTextsecond>
          </View>
          {errors.description && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.description}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="clock" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Duration</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"e.g., 3 months, 2 weeks"}
            placeholdercolor={secondaryTextColor}
            value={duration}
            onChange={(v: string) => { setDuration(v); setErrors((p) => ({ ...p, duration: "" })); }}
          />
          {errors.duration && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.duration}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="calendar-alt" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Completion Date</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Select completion date"}
            placeholdercolor={secondaryTextColor}
            prefix={true}
            fieldType="date"
            value={date}
            onChange={(v: string) => { setDate(v); setErrors((p) => ({ ...p, date: "" })); }}
            icon={<FontAwesome5 name="calendar" size={16} color="#ffffff" />}
          />
          {errors.date && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.date}</Text>
            </View>
          )}
        </View>
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="camera" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Project Image</ThemeTextsecond>
          </View>
          <TouchableOpacity
            onPress={pickImage}
            style={{ width: '100%', height: 140, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: primaryColor + '40', backgroundColor: primaryColor + '05', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            {isUploading ? (
              <View className="items-center">
                <ActivityIndicator size="large" color={primaryColor} />
                <View style={{ marginTop: 8 }}>
                  <ThemeTextsecond size={Textstyles.text_c}>Uploading...</ThemeTextsecond>
                </View>
              </View>
            ) : imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14, padding: 6 }}>
                  <FontAwesome5 name="edit" size={11} color="#ffffff" />
                </View>
              </>
            ) : (
              <View className="items-center">
                <FontAwesome5 name="cloud-upload-alt" size={28} color={primaryColor} />
                <View style={{ marginTop: 8 }}>
                  <Text style={[Textstyles.text_xxxsmall, { color: primaryColor }]}>Upload Image</Text>
                </View>
                <ThemeTextsecond size={Textstyles.text_c}>Tap to select from gallery</ThemeTextsecond>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 32, marginBottom: 16 }}>
        <ButtonFunction
          color={primaryColor}
          text={isLoading ? "Saving..." : existingData ? "Update Portfolio" : "Add Portfolio"}
          textcolor="#ffffff"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

interface PortfolioListProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  refreshFlag: boolean;
}

const PortfolioList = ({ setShowSlideUp, setEditData, refreshFlag }: PortfolioListProps) => {
  const { theme } = useTheme();
  const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getMutation = useMutation({
    mutationFn: portfoliosGetFn,
    onSuccess: (response) => setList(response.data),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Fetch failed";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: portfoliosDeleteFn,
    onSuccess: () => {
      toast.success("Portfolio item deleted successfully");
      setConfirmVisible(false);
      setSelectedItem(null);
      getMutation.mutate(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      toast.error(msg);
    },
  });

  useEffect(() => {
    getMutation.mutate(null);
  }, [refreshFlag]);

  const handleEdit = (data: any) => {
    setEditData(data);
    setShowSlideUp(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  const renderItem = ({ item: port }: { item: any }) => (
    <View
      style={{ backgroundColor: selectioncardColor, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
      className="shadow-sm"
    >
      {port.file ? (
        <Image source={{ uri: port.file }} style={{ width: '100%', height: 120, resizeMode: 'cover' }} />
      ) : null}
      <View className="flex-row">
        <View style={{ width: 4, backgroundColor: primaryColor }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View className="flex-row justify-between items-start">
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemeText size={Textstyles.text_xxmedium}>{port.title}</ThemeText>
              {port.description ? (
                <View style={{ marginTop: 4 }}>
                  <ThemeTextsecond size={Textstyles.text_c}>{port.description}</ThemeTextsecond>
                </View>
              ) : null}
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleEdit(port)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <Feather name="edit-2" size={15} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSelectedItem(port); setConfirmVisible(true); }}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: backgroundColortwo + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesome5 size={14} color={backgroundColortwo} name="trash" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row items-center" style={{ gap: 12, marginTop: 8 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <FontAwesome5 name="clock" size={11} color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_c}>{port.duration}</ThemeTextsecond>
            </View>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <FontAwesome5 name="calendar-alt" size={11} color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_c}>{formatDate(port.date)}</ThemeTextsecond>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (getMutation.isPending) {
    return (
      <View className="w-full items-center justify-center mt-10">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <View className="w-full items-center" style={{ paddingTop: 60 }}>
            <FontAwesome5 name="images" size={48} color={primaryColor + '40'} />
            <View style={{ marginTop: 16 }}>
              <ThemeTextsecond size={Textstyles.text_xsmall}>No portfolio items yet</ThemeTextsecond>
            </View>
            <View style={{ marginTop: 4 }}>
              <ThemeTextsecond size={Textstyles.text_c}>Tap "Add New" to showcase your work</ThemeTextsecond>
            </View>
          </View>
        }
      />
      <ConfirmModal
        visible={confirmVisible}
        title="Confirm Delete"
        message="Are you sure you want to delete this portfolio item?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { if (selectedItem?.id) deleteMutation.mutate(selectedItem.id); }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};