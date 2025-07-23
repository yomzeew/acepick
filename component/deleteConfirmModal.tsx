// component/ConfirmModal.tsx
import { Modal, View, Text, ActivityIndicator } from "react-native";
import { ThemeText, ThemeTextsecond } from "./ThemeText";
import ButtonComponent from "./buttonfunction";
import EmptyView from "./emptyview";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal = ({
  visible,
  title = "Confirm Action",
  message = "Are you sure?",
  onCancel,
  onConfirm,
  confirmText = "Yes",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmModalProps) => {
  const { theme } = useTheme();
  const { primaryColor, selectioncardColor } = getColors(theme);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 bg-black/40 justify-center items-center">
        <View
          style={{ backgroundColor: selectioncardColor }}
          className="rounded-lg p-6 w-[80%]"
        >
          <ThemeText size={Textstyles.text_cmedium}>
            <Text className="font-semibold mb-4 text-center">{title}</Text>
          </ThemeText>
          <ThemeTextsecond size={Textstyles.text_xxxsmall}>
            <Text className="text-center">{message}</Text>
          </ThemeTextsecond>

          <EmptyView height={10} />

          <View className="flex-row justify-between gap-x-3 w-full">
            <View className="w-[40%]">
              <ButtonComponent
                color="#ccc"
                text={cancelText}
                textcolor="#333"
                onPress={onCancel}
              />
            </View>
            <View className="w-[40%]">
              <ButtonComponent
                color={primaryColor}
                text={isLoading?<ActivityIndicator/>:confirmText}
                textcolor="#fff"
                onPress={onConfirm} 
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
