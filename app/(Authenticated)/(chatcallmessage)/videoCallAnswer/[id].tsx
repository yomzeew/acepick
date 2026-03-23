import VideoCallAnswer from 'component/menuComponent/chatMessaging/videoCallAnswer';
import { useLocalSearchParams } from 'expo-router';

export default function VideoCallAnswerRoute() {
  const { id } = useLocalSearchParams();

  return <VideoCallAnswer userId={id} />;
}
