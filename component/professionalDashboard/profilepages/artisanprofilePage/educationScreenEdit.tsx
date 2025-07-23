// EducationScreenEdit.tsx
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { AlertMessageBanner } from "component/AlertMessageBanner";
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
import { TouchableOpacity, View, Text } from "react-native";
import { ActivityIndicator, FlatList } from "react-native";
import { educationCreateFn, educationDeleteFn, educationGetFn, educationUpdateFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const EducationScreenEdit = () => {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);

  const [showSlideUp, setShowSlideUp] = useState(false);
  const [message, setMessage] = useState<{type:'error'|'success';msg:string}|null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // 🔄 toggle flag to trigger refetch

  const handleShowSlide = () => {
    setEditData(null);
    setShowSlideUp(true);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const refreshList = () => setRefreshFlag((prev) => !prev); // 🔄 toggle to refetch list

  return (
    <>
      {message && <AlertMessageBanner type={message?.type} message={message?.msg} />}
      {showSlideUp && (
        <SliderModalTemplate
          showmodal={showSlideUp}
          modalHeight={"90%"}
          setshowmodal={setShowSlideUp}
        >
          <AddEducation
            setShowSlideUp={setShowSlideUp}
            setMessage={setMessage}
            existingData={editData}
            setEditData={setEditData}
            refreshList={refreshList} // 🔄 passed down
          />
        </SliderModalTemplate>
      )}
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Portfolio"} />
          <View className="w-full items-end">
            <TouchableOpacity
              onPress={handleShowSlide}
              className="bg-green-500 px-3 w-20 rounded-2xl items-center justify-center py-2"
            >
              <Text className="text-white">Add new</Text>
            </TouchableOpacity>
          </View>
          <EmptyView height={20} />
          <Education
            setMessage={setMessage}
            setShowSlideUp={setShowSlideUp}
            setEditData={setEditData}
            refreshFlag={refreshFlag} // 🔄 passed down
          />
        </View>
      </ContainerTemplate>
    </>
  );
};
export default EducationScreenEdit;

interface AddEducationProps{
    setMessage: (value: any) => void;
    setShowSlideUp: (value: boolean) => void;
    setEditData: (value: any) => void;
    existingData: any;
    refreshList: () => void; // 🔄 add this
}

const AddEducation = ({ setShowSlideUp, setMessage, existingData, setEditData,refreshList }:AddEducationProps) => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor } = getColors(theme);

  const [school, setSchool] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const [course, setCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [gradDate, setGradDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    if (existingData) {
      setSchool(existingData?.school);
      setDegreeType(existingData?.degreeType);
      setCourse(existingData?.course);
      setStartDate(existingData?.startDate);
      setGradDate(existingData?.gradDate);
      setIsCurrent(existingData?.isCurrent);
    }
  }, [existingData]);

  const addMutation = useMutation({
    mutationFn: educationCreateFn,
    onSuccess: () => {
      setMessage({ type: "success", msg: "Education created successfully." });
      setShowSlideUp(false);
      setEditData(null);
      refreshList(); // 🔄 refresh list
    },
    onError: (err:any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
      setMessage({ type: "error", text: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: educationUpdateFn,
    onSuccess: () => {
      setMessage({ type: "success", msg: "Education updated successfully." });
      setShowSlideUp(false);
      setEditData(null);
      refreshList(); // 🔄 refresh list
    },
    onError: (err:any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      setMessage({ type: "error", text: msg });
    },
  });

  const handleSubmit = () => {
    if (!school || !degreeType || !course || !startDate || (!isCurrent && !gradDate)) {
      setMessage({ type: "error", text: "All fields are required." });
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
        console.log(existingData.id)
      updateMutation.mutate({ id: existingData.id, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <View className="w-full h-auto px-3 py-5">
      <View className="items-center">
        <ThemeText size={Textstyles.text_medium}>
          {existingData ? "Edit Education" : "Add Education"}
        </ThemeText>
      </View>
      <EmptyView height={20} />
      <InputComponent
        color={primaryColor}
        placeholder={"Institution"}
        placeholdercolor={secondaryTextColor}
        value={school}
        onChange={setSchool}
      />
      <EmptyView height={20} />
      <InputComponent
        color={primaryColor}
        placeholder={"Qualification"}
        placeholdercolor={secondaryTextColor}
        value={degreeType}
        onChange={setDegreeType}
      />
      <EmptyView height={20} />
      <InputComponent
        color={primaryColor}
        placeholder={"Course"}
        placeholdercolor={secondaryTextColor}
        value={course}
        onChange={setCourse}
      />
      <EmptyView height={20} />
      <InputComponent
        color={primaryColor}
        placeholder={"Start Date"}
        placeholdercolor={secondaryTextColor}
        value={startDate}
        onChange={setStartDate}
      />
      <EmptyView height={20} />
      {!isCurrent && (
        <InputComponent
          color={primaryColor}
          placeholder={"Graduation Date"}
          placeholdercolor={secondaryTextColor}
          value={gradDate}
          onChange={setGradDate}
        />
      )}
      <EmptyView height={40} />
      <ButtonFunction
        color={primaryColor}
        text={existingData ? "Update" : "Submit"}
        textcolor="#ffffff"
        onPress={handleSubmit}
      />
    </View>
  );
};

interface EducationProps {
    setMessage: (value: any) => void;
    setShowSlideUp: (value: boolean) => void;
    setEditData: (value: any) => void;
    refreshFlag: boolean; // 🔄 used to re-fetch data
  }
  


  const Education = ({
    setMessage,
    setShowSlideUp,
    setEditData,
    refreshFlag,
  }: EducationProps) => {
    const { theme } = useTheme();
    const { primaryColor, selectioncardColor } = getColors(theme);
    const [educationList, setEducationList] = useState<any[]>([]);
    const [confirmVisible, setConfirmVisible] = useState(false);
const [selectedEdu, setSelectedEdu] = useState<any>(null);
  
    const getMutation = useMutation({
      mutationFn: educationGetFn,
      onSuccess: (response) => setEducationList(response.data),
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? err?.message ?? "Fetch failed";
        setMessage({ type: "error", text: msg });
      },
    });

    const mutationDelete = useMutation({
        mutationFn: educationDeleteFn,
        onSuccess: () => {
          setMessage({ type: "success", text: "Education deleted successfully" });
          setConfirmVisible(false);
          setSelectedEdu(null);
          setTimeout(() => refreshFlag && getMutation.mutate(), 200); // Refresh list
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
          setMessage({ type: "error", text: msg });
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
  
    const renderItem = ({ item: edu }: { item: any }) => (
      <View
        key={edu.id}
        style={{ backgroundColor: selectioncardColor, elevation: 4 }}
        className="w-full h-auto py-3 px-3 shadow-sm shadow-black rounded-xl mb-3"
      >
        <View className="w-full flex-row justify-between items-center">
          <ThemeText size={Textstyles.text_small}>{edu.degreeType}</ThemeText>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleEdit(edu)}
              className="w-10 h-10 rounded-full items-center justify-center bg-blue-500"
            >
              <Feather name="edit" size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity   onPress={() => handleDeletePress(edu)} className="w-10 h-10 rounded-full items-center justify-center bg-red-500">
              <FontAwesome5 size={16} color="#ffffff" name="trash" />
            </TouchableOpacity>
          </View>
        </View>
        <ThemeTextsecond size={Textstyles.text_xsmall}>
          <Feather name="circle" color={primaryColor} size={10} /> {edu.school}
        </ThemeTextsecond>
        <EmptyView height={10} />
        <View className="flex-row justify-between">
          <ThemeText size={Textstyles.text_xsmall}>
            <FontAwesome5 name="book" /> {edu.course}
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_xsmall}>
            {edu.isCurrent ? "Present" : edu.gradDate}
          </ThemeTextsecond>
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
          <View className="w-full items-center mt-10">
            <ThemeTextsecond size={Textstyles.text_small}>No education records found</ThemeTextsecond>
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
  
