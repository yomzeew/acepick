import { useSocket } from 'hooks/useSocket';
import { useVideoCall } from 'hooks/useVideoCall';
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { MediaStream } from 'react-native-webrtc';
import CleanupService from 'services/cleanupService';

interface VideoCallContextType {
  isCalling: boolean;
  isConnecting: boolean;
  setIsCalling: (isCalling: boolean) => void;
  incomingCall: any;
  callUser: (id: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  hangUp: () => void;
  setPartnerId: (partnerId: string) => void;
  partnerId: string;
  localStream: { current: MediaStream | null };
  remoteStream: { current: MediaStream | null };
  hasRemoteStream: boolean;
  toggleCamera: () => void;
  toggleVideo: () => void;
  toggleMute: () => boolean;
  isFrontCamera: boolean;
  cleanupCall: () => Promise<void>;
}

const defaultVideoCallContext: VideoCallContextType = {
  isCalling: false,
  isConnecting: false,
  setIsCalling: () => {},
  incomingCall: null,
  callUser: async () => {},
  acceptCall: async () => {},
  rejectCall: async () => {},
  modalVisible: false,
  setModalVisible: () => {},
  hangUp: async () => {},
  setPartnerId: () => {},
  partnerId: '',
  localStream: { current: null },
  remoteStream: { current: null },
  hasRemoteStream: false,
  toggleCamera: () => {},
  toggleVideo: () => {},
  toggleMute: () => false,
  isFrontCamera: true,
  cleanupCall: async () => {},
};

const VideoCallContext = createContext<VideoCallContextType>(defaultVideoCallContext);

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const videoCallState = useVideoCall(socket);

  // Register video call cleanup function
  useEffect(() => {
    if (videoCallState.cleanupCall) {
      CleanupService.registerVideoCallCleanup(videoCallState.cleanupCall);
    }
    return () => {
      CleanupService.registerVideoCallCleanup(async () => {});
    };
  }, [videoCallState.cleanupCall]);

  return (
    <VideoCallContext.Provider value={socket ? videoCallState : defaultVideoCallContext}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};
