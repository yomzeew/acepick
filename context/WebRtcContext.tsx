// contexts/CallContext.tsx
import { useSocket } from 'hooks/useSocket';
import { useWebRtc } from 'hooks/useWebRTCCall';
import { createContext, useContext, ReactNode, useRef } from 'react';

type CallContextType = ReturnType<typeof useWebRtc>;

// Default context value when socket is not available
const defaultCallContext: CallContextType = {
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
};

const CallContext = createContext<CallContextType>(defaultCallContext);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const callState = useWebRtc(socket);

  return (
    <CallContext.Provider value={socket ? callState : defaultCallContext}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  return useContext(CallContext);
};