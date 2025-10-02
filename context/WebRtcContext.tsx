// contexts/CallContext.tsx
import { useSocket } from 'hooks/useSocket';
import { useWebRtc } from 'hooks/useWebRTCCall';
import { createContext, useContext, ReactNode } from 'react';


type CallContextType = ReturnType<typeof useWebRtc>;

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  
  if (!socket) return null; // or a loader/fallback
  const callState = useWebRtc(socket);

  return (
    <CallContext.Provider value={callState}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};