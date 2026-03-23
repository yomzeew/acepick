import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "context/ToastContext";
import ButtonFunction from "component/buttonfunction";
import InputComponent from "component/controls/textinput";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import ConfirmModal from "component/deleteConfirmModal";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import SliderModalTemplate from "component/slideupModalTemplate";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { certificationCreateFn, certificationDeleteFn, certificationGetFn, certificationUpdateFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const CertificationScreenEdit = () => {
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
          <AddCertification
            setShowSlideUp={setShowSlideUp}
            existingData={editData}
            setEditData={setEditData}
            refreshList={refreshList}
          />
        </SliderModalTemplate>
      )}
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Certifications"} />
          <View className="w-full flex-row justify-between items-center px-1" style={{ marginTop: 8 }}>
            <ThemeTextsecond size={Textstyles.text_c}>Your professional credentials</ThemeTextsecond>
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
          <CertificationList
            setShowSlideUp={setShowSlideUp}
            setEditData={setEditData}
            refreshFlag={refreshFlag}
          />
        </View>
      </ContainerTemplate>
    </>
  );
};
export default CertificationScreenEdit;

interface AddCertificationProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  existingData: any;
  refreshList: () => void;
}

const AddCertification = ({ setShowSlideUp, existingData, setEditData, refreshList }: AddCertificationProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [companyIssue, setCompanyIssue] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingData) {
      setTitle(existingData?.title || "");
      setCompanyIssue(existingData?.companyIssue || "");
      setDate(existingData?.date || "");
    }
  }, [existingData]);

  const addMutation = useMutation({
    mutationFn: certificationCreateFn,
    onSuccess: () => {
      toast.success("Certification added successfully.");
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
    mutationFn: certificationUpdateFn,
    onSuccess: () => {
      toast.success("Certification updated successfully.");
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
    if (!title.trim()) newErrors.title = "Certificate title is required";
    if (!companyIssue.trim()) newErrors.companyIssue = "Issuing organization is required";
    if (!date) newErrors.date = "Issue date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = { title, companyIssue, date, filePath: existingData?.filePath || "" };

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
          <FontAwesome5 name="award" size={20} color={primaryColor} />
        </View>
        <ThemeText size={Textstyles.text_small}>
          {existingData ? "Edit Certification" : "Add Certification"}
        </ThemeText>
        <View className="items-center mt-1">
          <ThemeTextsecond size={Textstyles.text_c}>
            {existingData ? "Update your certification details" : "Add your professional certifications"}
          </ThemeTextsecond>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="certificate" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Certificate</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Certificate Title"}
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
            <FontAwesome5 name="building" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Issuing Organization</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Organization Name"}
            placeholdercolor={secondaryTextColor}
            value={companyIssue}
            onChange={(v: string) => { setCompanyIssue(v); setErrors((p) => ({ ...p, companyIssue: "" })); }}
          />
          {errors.companyIssue && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.companyIssue}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="calendar-alt" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Issue Date</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Select issue date"}
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
      </View>

      <View className="mt-8 mb-4">
        <ButtonFunction
          color={primaryColor}
          text={isLoading ? "Saving..." : existingData ? "Update Certification" : "Add Certification"}
          textcolor="#ffffff"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

interface CertificationListProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  refreshFlag: boolean;
}

const CertificationList = ({ setShowSlideUp, setEditData, refreshFlag }: CertificationListProps) => {
  const { theme } = useTheme();
  const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getMutation = useMutation({
    mutationFn: certificationGetFn,
    onSuccess: (response) => setList(response.data),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Fetch failed";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: certificationDeleteFn,
    onSuccess: () => {
      toast.success("Certification deleted successfully");
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

  const renderItem = ({ item: cert }: { item: any }) => (
    <View
      style={{ backgroundColor: selectioncardColor, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
      className="shadow-sm"
    >
      <View className="flex-row">
        <View style={{ width: 4, backgroundColor: primaryColor }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View className="flex-row justify-between items-start">
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemeText size={Textstyles.text_xxmedium}>{cert.title}</ThemeText>
              <View className="flex-row items-center" style={{ gap: 6, marginTop: 4 }}>
                <FontAwesome5 name="building" size={11} color={primaryColor} />
                <ThemeTextsecond size={Textstyles.text_c}>{cert.companyIssue}</ThemeTextsecond>
              </View>
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleEdit(cert)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <Feather name="edit-2" size={15} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSelectedItem(cert); setConfirmVisible(true); }}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: backgroundColortwo + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesome5 size={14} color={backgroundColortwo} name="trash" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row items-center" style={{ gap: 6, marginTop: 8 }}>
            <FontAwesome5 name="calendar-alt" size={11} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>{formatDate(cert.date)}</ThemeTextsecond>
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
            <FontAwesome5 name="award" size={48} color={primaryColor + '40'} />
            <View style={{ marginTop: 16 }}>
              <ThemeTextsecond size={Textstyles.text_xsmall}>No certifications added yet</ThemeTextsecond>
            </View>
            <View style={{ marginTop: 4 }}>
              <ThemeTextsecond size={Textstyles.text_c}>Tap "Add New" to get started</ThemeTextsecond>
            </View>
          </View>
        }
      />
      <ConfirmModal
        visible={confirmVisible}
        title="Confirm Delete"
        message="Are you sure you want to delete this certification?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { if (selectedItem?.id) deleteMutation.mutate(selectedItem.id); }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
