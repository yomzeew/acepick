import VideoCallPage from 'component/menuComponent/chatMessaging/videocallpage';
import { useLocalSearchParams } from 'expo-router';

export default function VideoCallRoute() {
  const { id } = useLocalSearchParams();

  return <VideoCallPage userDetails={id as string} />;
}
