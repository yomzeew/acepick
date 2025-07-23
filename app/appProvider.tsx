import { ReactNode, useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import { Provider, useDispatch } from "react-redux";
import '../global.css';
import {store,persistor} from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from "context/roleContext";
import { registerForPushNotificationsAsync, setupNotificationListeners } from "services/notificationServices";
import { SaveTokenFunction } from "services/userService";
import { useSecureAuth } from "hooks/useSecureAuth";
import { SocketProvider } from "hooks/useSocket";
import { PersistGate } from "redux-persist/integration/react";
import { initializeSocketListeners } from "services/socketHandler";
import NotificationWrapper from "./NotificationWrapper";
import { CallProvider } from "context/WebRtcContext";



const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  useEffect(() => {
    initializeSocketListeners();
  }, []);
  return (
    <RoleProvider>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationWrapper>
        <QueryClientProvider client={queryClient}>
         <SocketProvider>
       
         <CallProvider>
          <GestureHandlerRootView>
            {children}
          </GestureHandlerRootView>
          </CallProvider>
         
        
          </SocketProvider>
        </QueryClientProvider>
        </NotificationWrapper>
        
        </PersistGate>
      </Provider>
    </RoleProvider>
  );
};

export default AppProvider;
