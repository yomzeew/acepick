// EducationScreenEdit.tsx
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
import { TouchableOpacity, View, Text, ScrollView, Switch } from "react-native";
import { ActivityIndicator, FlatList } from "react-native";
import { educationCreateFn, educationDeleteFn, educationGetFn, educationUpdateFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const EducationScreenEdit = () => {
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
        <SliderModalTemplate
          showmodal={showSlideUp}
          modalHeight={"90%"}
          setshowmodal={setShowSlideUp}
        >
          <AddEducation
            setShowSlideUp={setShowSlideUp}
            existingData={editData}
            setEditData={setEditData}
            refreshList={refreshList}
          />
        </SliderModalTemplate>
      )}
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Education"} />
          <View className="w-full flex-row justify-between items-center px-1" style={{ marginTop: 8 }}>
            <ThemeTextsecond size={Textstyles.text_c}>Your academic qualifications</ThemeTextsecond>
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
          <Education
            setShowSlideUp={setShowSlideUp}
            setEditData={setEditData}
            refreshFlag={refreshFlag}
          />
        </View>
      </ContainerTemplate>
    </>
  );
};
export default EducationScreenEdit;

interface AddEducationProps{
    setShowSlideUp: (value: boolean) => void;
    setEditData: (value: any) => void;
    existingData: any;
    refreshList: () => void;
}

const AddEducation = ({ setShowSlideUp, existingData, setEditData, refreshList }:AddEducationProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const toast = useToast();

  const [school, setSchool] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const [course, setCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [gradDate, setGradDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (existingData) {
      setSchool(existingData?.school || "");
      setDegreeType(existingData?.degreeType || "");
      setCourse(existingData?.course || "");
      setStartDate(existingData?.startDate || "");
      setGradDate(existingData?.gradDate || "");
      setIsCurrent(existingData?.isCurrent ?? false);
    }
  }, [existingData]);

  const addMutation = useMutation({
    mutationFn: educationCreateFn,
    onSuccess: () => {
      toast.success("Education created successfully.");
      setShowSlideUp(false);
      setEditData(null);
      refreshList();
    },
    onError: (err:any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: educationUpdateFn,
    onSuccess: () => {
      toast.success("Education updated successfully.");
      setShowSlideUp(false);
      setEditData(null);
      refreshList();
    },
    onError: (err:any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      toast.error(msg);
    },
  });

  const isLoading = addMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!school || !degreeType || !course || !startDate || (!isCurrent && !gradDate)) {
      toast.error("All fields are required.");
      return;
    }

    const payload = {
      school,
      degreeType,
      course,
      startDate,
      gradDate: isCurrent ? null : gradDate,
      isCurrent,
    };

    if (existingData?.id) {
      updateMutation.mutate({ id: existingData.id, payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <ScrollView className="w-full" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}>
      <View className="items-center mb-6">
        <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: primaryColor + "20" }}>
          <FontAwesome5 name="graduation-cap" size={20} color={primaryColor} />
        </View>
        <ThemeText size={Textstyles.text_small}>
          {existingData ? "Edit Education" : "Add Education"}
        </ThemeText>
        <View className="items-center mt-1">
          <ThemeTextsecond size={Textstyles.text_c}>
            {existingData ? "Update your educational background" : "Add your academic qualifications"}
          </ThemeTextsecond>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="university" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Institution</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"School/Institution Name"}
            placeholdercolor={secondaryTextColor}
            value={school}
            onChange={(v: string) => { setSchool(v); setErrors((p) => ({ ...p, school: "" })); }}
          />
          {errors.school && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.school}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="award" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Degree</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Degree Type (e.g., BSc, MSc, PhD)"}
            placeholdercolor={secondaryTextColor}
            value={degreeType}
            onChange={(v: string) => { setDegreeType(v); setErrors((p) => ({ ...p, degreeType: "" })); }}
          />
          {errors.degreeType && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.degreeType}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 8 }}>
            <FontAwesome5 name="book" size={14} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Field of Study</ThemeTextsecond>
          </View>
          <InputComponent
            color={primaryColor}
            placeholder={"Course of Study"}
            placeholdercolor={secondaryTextColor}
            value={course}
            onChange={(v: string) => { setCourse(v); setErrors((p) => ({ ...p, course: "" })); }}
          />
          {errors.course && (
            <View className="flex-row items-center mt-2">
              <FontAwesome5 name="exclamation-circle" size={12} color={backgroundColortwo} />
              <Text style={[Textstyles.text_xxxsmall, { color: backgroundColortwo }]} className="ml-1">{errors.course}</Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
          <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
            <FontAwesome5 name="calendar-alt" size={13} color={primaryColor} />
            <ThemeTextsecond size={Textstyles.text_c}>Study Period</ThemeTextsecond>
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
                <ThemeTextsecond size={Textstyles.text_c}>Currently studying</ThemeTextsecond>
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
                  <ThemeTextsecond size={Textstyles.text_c}>Graduation Date</ThemeTextsecond>
                </View>
                <InputComponent
                  color={primaryColor}
                  placeholder={"Select graduation date"}
                  placeholdercolor={secondaryTextColor}
                  prefix={true}
                  fieldType="date"
                  value={gradDate}
                  onChange={(v: string) => { setGradDate(v); setErrors((p) => ({ ...p, gradDate: "" })); }}
                  icon={<FontAwesome5 name="calendar" size={14} color="#ffffff" />}
                />
                {errors.gradDate && (
                  <View className="flex-row items-center" style={{ gap: 4, marginTop: 6 }}>
                    <FontAwesome5 name="exclamation-circle" size={10} color={backgroundColortwo} />
                    <Text style={[Textstyles.text_c, { color: backgroundColortwo }]}>{errors.gradDate}</Text>
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
          text={isLoading ? "Saving..." : existingData ? "Update Education" : "Add Education"}
          textcolor="#ffffff"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};

interface EducationProps {
    setShowSlideUp: (value: boolean) => void;
    setEditData: (value: any) => void;
    refreshFlag: boolean;
  }

  const Education = ({
    setShowSlideUp,
    setEditData,
    refreshFlag,
  }: EducationProps) => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor, backgroundColortwo } = getColors(theme);
    const toast = useToast();
    const [educationList, setEducationList] = useState<any[]>([]);
    const [confirmVisible, setConfirmVisible] = useState(false);
const [selectedEdu, setSelectedEdu] = useState<any>(null);
  
    const getMutation = useMutation({
      mutationFn: educationGetFn,
      onSuccess: (response) => setEducationList(response.data),
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? err?.message ?? "Fetch failed";
        toast.error(msg);
      },
    });

    const mutationDelete = useMutation({
        mutationFn: educationDeleteFn,
        onSuccess: () => {
          toast.success("Education deleted successfully");
          setConfirmVisible(false);
          setSelectedEdu(null);
          setTimeout(() => refreshFlag && getMutation.mutate(), 200);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
          toast.error(msg);
        },
      });
  
    useEffect(() => {
      getMutation.mutate();
    }, [refreshFlag]);
  
    const handleDeletePress = (edu: any) => {
        console.log('ok')
        setSelectedEdu(edu);
       
        setConfirmVisible(true);
      };
      
      const handleDeleteConfirm = () => {
        if (selectedEdu?.id) {
          mutationDelete.mutate(selectedEdu.id );
        }
      };

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

    const renderItem = ({ item: edu }: { item: any }) => (
      <View
        key={edu.id}
        style={{ backgroundColor: selectioncardColor, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}
        className="shadow-sm"
      >
        <View className="flex-row">
          <View style={{ width: 4, backgroundColor: primaryColor }} />
          <View style={{ flex: 1, padding: 14 }}>
            <View className="flex-row justify-between items-start">
              <View style={{ flex: 1, marginRight: 8 }}>
                <ThemeText size={Textstyles.text_xxmedium}>{edu.degreeType}</ThemeText>
                <View className="flex-row items-center" style={{ gap: 6, marginTop: 4 }}>
                  <FontAwesome5 name="university" size={11} color={primaryColor} />
                  <ThemeTextsecond size={Textstyles.text_c}>{edu.school}</ThemeTextsecond>
                </View>
              </View>
              <View className="flex-row" style={{ gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleEdit(edu)}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: primaryColor + '15', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Feather name="edit-2" size={15} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePress(edu)}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: backgroundColortwo + '15', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesome5 size={14} color={backgroundColortwo} name="trash" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row items-center" style={{ gap: 6, marginTop: 8 }}>
              <FontAwesome5 name="book" size={11} color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_c}>{edu.course}</ThemeTextsecond>
            </View>
            <View className="flex-row items-center" style={{ gap: 6, marginTop: 4 }}>
              <FontAwesome5 name="calendar-alt" size={11} color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_c}>
                {formatDate(edu.startDate)} - {edu.isCurrent ? "Present" : formatDate(edu.gradDate)}
              </ThemeTextsecond>
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
        data={educationList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <View className="w-full items-center" style={{ paddingTop: 60 }}>
            <FontAwesome5 name="graduation-cap" size={48} color={primaryColor + '40'} />
            <View style={{ marginTop: 16 }}>
              <ThemeTextsecond size={Textstyles.text_xsmall}>No education added yet</ThemeTextsecond>
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
  message="Are you sure you want to delete this education record?"
  onCancel={() => setConfirmVisible(false)}
  onConfirm={handleDeleteConfirm}
  isLoading={mutationDelete.isPending}
/>
        </>
    
    );
  };
  
