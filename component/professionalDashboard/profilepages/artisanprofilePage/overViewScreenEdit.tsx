import { useMutation } from "@tanstack/react-query";
import { FontAwesome5 } from "@expo/vector-icons";
import { useToast } from "context/ToastContext";
import ButtonFunction from "component/buttonfunction";
import { InputComponentTextarea } from "component/controls/textinput";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, View, Text } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { updateProfessionalProfileFn } from "services/userService";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

const OverviewScreenEdit = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor } = getColors(theme);
  const professional = useSelector((state: RootState) => state.auth.user?.profile?.professional);

  const toast = useToast();
  const [intro, setIntro] = useState("");

  useEffect(() => {
    if (professional?.intro) {
      setIntro(professional.intro);
    }
  }, [professional]);

  const mutation = useMutation({
    mutationFn: updateProfessionalProfileFn,
    onSuccess: () => {
      toast.success("Intro updated successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
      toast.error(msg);
    },
  });

  const handleSave = () => {
    if (!intro.trim()) {
      toast.error("Please enter your professional intro.");
      return;
    }
    mutation.mutate({ intro });
  };

  return (
    <>
      <ContainerTemplate>
        <View className="h-full w-full flex-col">
          <HeaderComponent title={"Professional Intro"} />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 w-full items-center">
              <EmptyView height={20} />
              <KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: "100%" }}>
                <ScrollView
                  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="items-center mb-6">
                    <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: primaryColor + "20" }}>
                      <FontAwesome5 name="user" size={20} color={primaryColor} />
                    </View>
                    <ThemeText size={Textstyles.text_small}>Professional Introduction</ThemeText>
                    <View className="items-center mt-1">
                      <ThemeTextsecond size={Textstyles.text_c}>
                        Tell clients about your expertise and what makes you unique
                      </ThemeTextsecond>
                    </View>
                  </View>

                  <View style={{ backgroundColor: selectioncardColor, borderRadius: 12, padding: 16 }}>
                    <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
                      <FontAwesome5 name="pen-fancy" size={14} color={primaryColor} />
                      <ThemeTextsecond size={Textstyles.text_c}>Your Introduction</ThemeTextsecond>
                    </View>
                    <InputComponentTextarea
                      color={primaryColor}
                      placeholder={"Describe your professional background, skills, and the services you offer..."}
                      placeholdercolor={secondaryTextColor}
                      multiline={true}
                      value={intro}
                      onChange={setIntro}
                    />
                    <View className="w-full items-end mt-3 flex-row justify-between">
                      <ThemeTextsecond size={Textstyles.text_c}>
                        Minimum 50 characters recommended
                      </ThemeTextsecond>
                      <ThemeTextsecond size={Textstyles.text_c}>
                        {intro.length}/500 characters
                      </ThemeTextsecond>
                    </View>
                  </View>

                  <View className="mt-6" style={{ backgroundColor: primaryColor + '10', borderRadius: 12, padding: 16 }}>
                    <View className="flex-row items-start">
                      <FontAwesome5 name="lightbulb" size={14} color={primaryColor} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[Textstyles.text_c, { color: primaryColor, fontWeight: '600' }]}>Pro Tip</Text>
                        <View style={{ marginTop: 4 }}>
                          <ThemeTextsecond size={Textstyles.text_c}>
                            Include your years of experience, key skills, and what sets you apart from other professionals in your field.
                          </ThemeTextsecond>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </ContainerTemplate>
      <View className="absolute bottom-10 w-full px-3">
        <ButtonFunction
          color={primaryColor}
          text={mutation.isPending ? "Saving..." : "Save Introduction"}
          textcolor={"#ffffff"}
          onPress={handleSave}
        />
      </View>
    </>
  );
};
export default OverviewScreenEdit;