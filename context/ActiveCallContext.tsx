import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import DeviceIdService from 'services/deviceIdService';

export type ActiveCallType = 'voice' | 'video' | null;

interface ActiveCallInfo {
  type: ActiveCallType;
  route: string;
  partnerId: string;
  startTime: number;
  elapsed: number;
  deviceId: string;
}

interface ActiveCallContextType {
  activeCall: ActiveCallInfo | null;
  setActiveCall: (info: ActiveCallInfo | null) => void;
  startCall: (type: 'voice' | 'video', route: string, partnerId: string) => void;
  endCall: () => void;
  updateElapsed: (elapsed: number) => void;
  getDeviceId: () => string | null;
}

const ActiveCallContext = createContext<ActiveCallContextType>({
  activeCall: null,
  setActiveCall: () => {},
  startCall: () => {},
  endCall: () => {},
  updateElapsed: () => {},
  getDeviceId: () => null,
});

export const ActiveCallProvider = ({ children }: { children: ReactNode }) => {
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Initialize device ID on mount
  useEffect(() => {
    const initDeviceId = async () => {
      try {
        const id = await DeviceIdService.getDeviceId();
        setDeviceId(id);
      } catch (error) {
        console.error('Error initializing device ID:', error);
      }
    };
    
    initDeviceId();
  }, []);

  const startCall = useCallback((type: 'voice' | 'video', route: string, partnerId: string) => {
    if (!deviceId) {
      console.warn('Cannot start call - no device ID available');
      return;
    }
    setActiveCall({ type, route, partnerId, startTime: Date.now(), elapsed: 0, deviceId });
  }, [deviceId]);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const updateElapsed = useCallback((elapsed: number) => {
    setActiveCall(prev => prev ? { ...prev, elapsed } : null);
  }, []);

  const getDeviceId = useCallback(() => deviceId, [deviceId]);

  return (
    <ActiveCallContext.Provider value={{ activeCall, setActiveCall, startCall, endCall, updateElapsed, getDeviceId }}>
      {children}
    </ActiveCallContext.Provider>
  );
};

export const useActiveCall = () => useContext(ActiveCallContext);
