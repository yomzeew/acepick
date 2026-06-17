import { ReactNode } from "react";
import { Provider } from "react-redux";
import '../global.css';
import {store,persistor} from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from "context/roleContext";
import { SocketProvider } from "hooks/useSocket";
import { PersistGate } from "redux-persist/integration/react";
import { CallProvider } from "context/WebRtcContext";
import { VideoCallProvider } from "context/VideoCallContext";
import { ActiveCallProvider } from "context/ActiveCallContext";
import { NotificationWrapper } from "./NotificationWrapper";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408/429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return error?.response?.status === 408 || error?.response?.status === 429;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <RoleProvider>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
         <SocketProvider>
       
         <CallProvider>
          <VideoCallProvider>
          <ActiveCallProvider>
          <GestureHandlerRootView>
            <NotificationWrapper>
              {children}
            </NotificationWrapper>
          </GestureHandlerRootView>
          </ActiveCallProvider>
          </VideoCallProvider>
          </CallProvider>
          </SocketProvider>
        </QueryClientProvider>
        
        </PersistGate>
      </Provider>
    </RoleProvider>
  );
};

export default AppProvider;
