import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Platform, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { RootState } from "redux/store";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useSocket } from "hooks/useSocket";
import { addMessage, ChatMessage } from "redux/slices/chatSlice";
import { uploadGenericFile } from "services/supabaseStorage";

interface MessageInputProps {
  receiverId: string;
  message: string;
  setMessage: (val: string) => void;
  onSend: () => void;
}

const MessageInput = ({ receiverId, message, setMessage, onSend }: MessageInputProps) => {
  const { theme } = useTheme();
  const { secondaryTextColor, primaryColor, selectioncardColor, subText, backgroundColor } =
    getColors(theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const sendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!user?.id || !receiverId || !roomId) return;

      setIsUploading(true);
      try {
        const imageUrl = await uploadGenericFile(asset.uri, 'chat');
        const payload: ChatMessage = {
          from: user.id,
          to: receiverId,
          text: `<img>${imageUrl}`,
          room: roomId,
          timestamp: new Date().toISOString(),
        };
        socket?.emit("send_message", payload);
        dispatch(addMessage(payload));
      } catch (error) {
        console.error('Chat image upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const hasText = message.trim().length > 0;

  return (
    <View
      className="px-4 py-2 flex-row items-end gap-x-2"
      style={{
        backgroundColor: backgroundColor,
        borderTopWidth: 1,
        borderTopColor: selectioncardColor,
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
      }}
    >
      {/* Attach */}
      <TouchableOpacity
        onPress={sendImage}
        disabled={isUploading}
        className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
        style={{ backgroundColor: selectioncardColor }}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <Ionicons name="attach" size={20} color={primaryColor} />
        )}
      </TouchableOpacity>

      {/* Text input */}
      <View
        className="flex-1 flex-row items-end rounded-2xl px-4 py-2"
        style={{
          backgroundColor: selectioncardColor,
          minHeight: 42,
          maxHeight: 120,
        }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={subText}
          multiline
          style={{
            flex: 1,
            color: secondaryTextColor,
            fontSize: 14,
            fontFamily: "TTFirsNeue",
            maxHeight: 100,
            paddingTop: Platform.OS === "ios" ? 4 : 0,
            paddingBottom: Platform.OS === "ios" ? 4 : 0,
          }}
        />
      </View>

      {/* Send */}
      <TouchableOpacity
        onPress={onSend}
        disabled={!hasText}
        className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
        style={{
          backgroundColor: hasText ? primaryColor : primaryColor + "40",
        }}
      >
        <Ionicons
          name="send"
          size={18}
          color="#fff"
          style={{ marginLeft: 2 }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;