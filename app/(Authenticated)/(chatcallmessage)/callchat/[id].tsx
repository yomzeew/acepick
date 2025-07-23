// app/mainchat/[id].tsx
import CallChat from 'component/menuComponent/chatMessaging/callpage';
import { useLocalSearchParams } from 'expo-router';


export default function ChatPage() {
  const { id } = useLocalSearchParams();

  return <CallChat userDetails={id as string} />;
}
