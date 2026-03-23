import { useSocket } from 'hooks/useSocket';
import { useVideoCall } from 'hooks/useVideoCall';
import { createContext, useContext, ReactNode } from 'react';

type VideoCallContextType = ReturnType<typeof useVideoCall>;

const defaultVideoCallContext: VideoCallContextType = {
  isCalling: false,
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
  toggleCamera: () => {},
  toggleVideo: () => {},
  toggleMute: () => {},
  isFrontCamera: true,
};

const VideoCallContext = createContext<VideoCallContextType>(defaultVideoCallContext);

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const videoCallState = useVideoCall(socket);

  return (
    <VideoCallContext.Provider value={socket ? videoCallState : defaultVideoCallContext}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCallContext = () => {
  return useContext(VideoCallContext);
};
