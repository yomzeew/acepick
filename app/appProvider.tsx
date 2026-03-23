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
import { NotificationWrapper } from "./NotificationWrapper";



const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <RoleProvider>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
         <SocketProvider>
       
         <CallProvider>
          <VideoCallProvider>
          <GestureHandlerRootView>
            <NotificationWrapper>
              {children}
            </NotificationWrapper>
          </GestureHandlerRootView>
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
