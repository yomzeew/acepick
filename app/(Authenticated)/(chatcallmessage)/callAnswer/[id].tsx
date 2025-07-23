// app/mainchat/[id].tsx

import CallAnswer from 'component/menuComponent/chatMessaging/callAnswer';
import { useLocalSearchParams } from 'expo-router';


export default function ChatPage() {
  const { id } = useLocalSearchParams();

  return <CallAnswer userId={id} />
}