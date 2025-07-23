// app/mainchat/[id].tsx
import MainChatScreen from 'component/menuComponent/chatMessaging/mainChat';
import { useLocalSearchParams } from 'expo-router';


export default function ChatPage() {
  const { id } = useLocalSearchParams();

  return <MainChatScreen userDetails={id as string} />;
}
