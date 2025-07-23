import { FontAwesome5 } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from 'redux/store';
import { emitSendMessage, emitUploadFile } from 'services/socketHandler';
import InputComponent from 'component/controls/textinput';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { useSocket } from 'hooks/useSocket';
import { addMessage, ChatMessage } from 'redux/chatSlice';
import { selectChatMessages } from 'utilizes/chatselector';
import ContainerTemplate from 'component/dashboardComponent/containerTemplate';

const MessageInput = ({ receiverId,message, setMessage,onSend }: {receiverId:string; message: string; setMessage: (val: string) => void; onSend:()=>void}) => {
    const {theme}=useTheme()
  const {secondaryTextColor,primaryColor,backgroundColor}=getColors(theme)
  const user = useSelector((state: RootState) => state.auth.user);
    const roomId = useSelector((state: RootState) => state.chat.roomId);
    const { socket } = useSocket();
    const dispatch = useDispatch();

  const sendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const image=asset.base64
      if (!user?.id || !receiverId || !roomId || !image ) return;
      const payload:ChatMessage = {
        image: asset.base64,
        fileName: asset.fileName ?? "image.jpg",
        from: user?.id ?? "",
        to: receiverId,
        room: roomId,
        timestamp: new Date().toISOString(),
      };
  
      socket?.emit("upload_file", payload);
      dispatch(addMessage({ roomId, message: payload }));
    } else {
      alert("No image selected.");
    }
  };

  return (
    <View style={{backgroundColor:backgroundColor}} className="absolute bottom-0 left-0 right-0 px-4 py-2 flex-row items-center gap-x-1">
      <TouchableOpacity className='px-3 py-3 rounded-2xl' style={{backgroundColor:primaryColor}} onPress={onSend}>
        <FontAwesome5 name="paperclip" size={20} color="#fff" onPress={sendImage} />
      </TouchableOpacity>
      <View className='w-3/4'>
      <InputComponent
              value={message}
              onChange={setMessage}
              placeholder="Type a message..." 
              color={primaryColor} 
              placeholdercolor={secondaryTextColor}     
               />

      </View>

      <TouchableOpacity className='px-3 py-3 rounded-2xl' style={{backgroundColor:primaryColor}} onPress={onSend}>
        <FontAwesome5 name="paper-plane" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;