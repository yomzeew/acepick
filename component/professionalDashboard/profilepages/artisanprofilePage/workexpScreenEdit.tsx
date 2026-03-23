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
import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, Switch, ScrollView } from "react-native";
import { experinceCreateFn, experinceDeleteFn, experinceGetFn, experinceUpdateFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const WorkExpScreenEdit = () => {
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
          <AddWorkExp
            setShowSlideUp={setShowSlideUp}
            existingData={editData}
            setEditData={setEditData}
            refreshList={refreshList}
          />
        </SliderModalTemplate>
      )}
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Work Experience"} />
          <View className="w-full flex-row justify-between items-center px-1" style={{ marginTop: 8 }}>
            <ThemeTextsecond size={Textstyles.text_c}>Manage your work history</ThemeTextsecond>
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
          <ExperienceList
            setShowSlideUp={setShowSlideUp}
            setEditData={setEditData}
            refreshFlag={refreshFlag}
          />
        </View>
      </ContainerTemplate>
    </>
  );
};
export default WorkExpScreenEdit;

interface AddWorkExpProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  existingData: any;
  refreshList: () => void;
}

const AddWorkExp = ({ setShowSlideUp, existingData, setEditData, refreshList }: AddWorkExpProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();

  const [postHeld, setPostHeld] = useState("");
  const [workPlace, setWorkPlace] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingData) {
      setPostHeld(existingData?.postHeld || "");
      setWorkPlace(existingData?.workPlace || "");
      setDescription(existingData?.description || "");
      setStartDate(existingData?.startDate || "");
      setEndDate(existingData?.endDate || "");
      setIsCurrent(existingData?.isCurrent || false);
    }
  }, [existingData]);

  const addMutation = useMutation({
    mutationFn: experinceCreateFn,
    onSuccess: () => {
      toast.success("Experience added successfully.");
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
    mutationFn: experinceUpdateFn,
    onSuccess: () => {
      toast.success("Experience updated successfully.");
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
    if (!postHeld.trim()) newErrors.postHeld = "Job title is required";
    if (!workPlace.trim()) newErrors.workPlace = "Company name is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!isCurrent && !endDate) newErrors.endDate = "End date is required";
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      postHeld,
      workPlace,
      description: description || undefined,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
    };

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
          <FontAwesome5 name="briefcase" size={20} color={primaryColor} />
        </View>
        <ThemeText size={Textstyles.text_small}>
          {existingData ? "Edit Experience" : "Add Experience"}
        </ThemeText>
        <View className="items-center mt-1">
          <ThemeTextsecond size={Textstyles.text_c}>
            {existingData ? "Update your work experience details" : "Tell us about your professional journey"}
          </ThemeTextsecond>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="user-tie" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Position</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Job Title / Position"}
            placeholdercolor={secondaryTextColor}
            value={postHeld}
            onChange={(v: string) => { setPostHeld(v); setErrors((p) => ({ ...p, postHeld: "" })); }}
          />
          {errors.postHeld && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.postHeld}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="building" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Company</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Company / Workplace"}
            placeholdercolor={secondaryTextColor}
            value={workPlace}
            onChange={(v: string) => { setWorkPlace(v); setErrors((p) => ({ ...p, workPlace: "" })); }}
          />
          {errors.workPlace && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.workPlace}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="align-left" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Description (Optional)</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Brief description of your role and achievements"}
            placeholdercolor={secondaryTextColor}
            value={description}
            onChange={setDescription}
          />
          <View className="w-full items-end mt-1">
            <ThemeTextsecond size={Textstyles.text_c}>{description.length}/200 characters</ThemeTextsecond>
          </View>
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
            <FontAwesome5 name="calendar-alt" size={13} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Duration</ThemeTextsecond>
          </View>
          <View style={{ gap: 12 }}>
            <View>
              <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                <FontAwesome5 name="play" size={9} color={primaryColor} />
                <ThemeTextsecond size={Textstyles.text_c}>Start Date</ThemeTextsecond>
              </View>
              <InputComponent
                color={primaryColor}
                placeholder={"Select start date"}
                placeholdercolor={secondaryTextColor}
                prefix={true}
                fieldType="date"
                value={startDate}
                onChange={(v: string) => { setStartDate(v); setErrors((p) => ({ ...p, startDate: "" })); }}
                icon={<FontAwesome5 name="calendar" size={14} color="#ffffff" />}
              />
              {errors.startDate && (
                <View className="flex-row items-center" style={{ gap: 4, marginTop: 6 }}>
                  <FontAwesome5 name="exclamation-circle" size={10} color={backgroundColortwo} />
                  <Text style={[Textstyles.text_c, { color: backgroundColortwo }]}>{errors.startDate}</Text>
                </View>
              )}
            </View>

            <View
              className="flex-row items-center justify-between"
              style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: primaryColor + '08', borderRadius: 10, borderWidth: 1, borderColor: primaryColor + '20' }}
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <FontAwesome5 name="clock" size={12} color={primaryColor} />
                <ThemeTextsecond size={Textstyles.text_c}>Currently working here</ThemeTextsecond>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: primaryColor }}
                thumbColor={isCurrent ? "#f4f3f4" : "#fff"}
                onValueChange={setIsCurrent}
                value={isCurrent}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>

            {!isCurrent && (
              <View>
                <View className="flex-row items-center" style={{ gap: 6, marginBottom: 6 }}>
                  <FontAwesome5 name="stop" size={9} color={primaryColor} />
                  <ThemeTextsecond size={Textstyles.text_c}>End Date</ThemeTextsecond>
                </View>
                <InputComponent
                  color={primaryColor}
                  placeholder={"Select end date"}
                  placeholdercolor={secondaryTextColor}
                  prefix={true}
                  fieldType="date"
                  value={endDate}
                  onChange={(v: string) => { setEndDate(v); setErrors((p) => ({ ...p, endDate: "" })); }}
                  icon={<FontAwesome5 name="calendar" size={14} color="#ffffff" />}
                />
                {errors.endDate && (
                  <View className="flex-row items-center" style={{ gap: 4, marginTop: 6 }}>
                    <FontAwesome5 name="exclamation-circle" size={10} color={backgroundColortwo} />
                    <Text style={[Textstyles.text_c, { color: backgroundColortwo }]}>{errors.endDate}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="mt-8 mb-4">
        <ButtonFunction
          color={primaryColor}
          text={isLoading ? "Saving..." : existingData ? "Update Experience" : "Add Experience"}
          textcolor="#ffffff"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

interface ExperienceListProps {
  setShowSlideUp: (value: boolean) => void;
  setEditData: (value: any) => void;
  refreshFlag: boolean;
}

const ExperienceList = ({ setShowSlideUp, setEditData, refreshFlag }: ExperienceListProps) => {
  const { theme } = useTheme();
  const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getMutation = useMutation({
    mutationFn: experinceGetFn,
    onSuccess: (response) => setList(response.data),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Fetch failed";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: experinceDeleteFn,
    onSuccess: () => {
      toast.success("Experience deleted successfully");
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
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  const renderItem = ({ item: exp }: { item: any }) => (
    <View
      style={{ backgroundColor: selectioncardColor, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
      className="shadow-sm"
    >
      <View className="flex-row">
        <View style={{ width: 4, backgroundColor: primaryColor }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View className="flex-row justify-between items-start">
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemeText size={Textstyles.text_xxmedium}>{exp.postHeld}</ThemeText>
              <View className="flex-row items-center" style={{ gap: 6, marginTop: 4 }}>
                <FontAwesome5 name="building" size={11} color={primaryColor} />
                <ThemeTextsecond size={Textstyles.text_c}>{exp.workPlace}</ThemeTextsecond>
              </View>
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleEdit(exp)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <Feather name="edit-2" size={15} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSelectedItem(exp); setConfirmVisible(true); }}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: backgroundColortwo + '15', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesome5 size={14} color={backgroundColortwo} name="trash" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row items-center" style={{ gap: 6, marginTop: 8 }}>
            <FontAwesome5 color={primaryColor} size={11} name="calendar-alt" />
            <ThemeTextsecond size={Textstyles.text_c}>
              {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
            </ThemeTextsecond>
          </View>
          {exp.description ? (
            <View style={{ marginTop: 6 }}>
              <ThemeTextsecond size={Textstyles.text_c}>{exp.description}</ThemeTextsecond>
            </View>
          ) : null}
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
            <FontAwesome5 name="briefcase" size={48} color={primaryColor + '40'} />
            <View style={{ marginTop: 16 }}>
              <ThemeTextsecond size={Textstyles.text_xsmall}>No experience added yet</ThemeTextsecond>
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
        message="Are you sure you want to delete this experience record?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { if (selectedItem?.id) deleteMutation.mutate(selectedItem.id); }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};