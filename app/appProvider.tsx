import { ReactNode, useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import { Provider } from "react-redux";
import '../global.css';
import store from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleProvider } from "context/roleContext";
import { registerForPushNotificationsAsync, setupNotificationListeners } from "services/notificationServices";
import { SaveTokenFunction } from "services/userService";
import { useSecureAuth } from "hooks/useSecureAuth";
import { SocketProvider } from "hooks/useSocket";

const AppProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const { getAuthData } = useSecureAuth();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      const authdata = await getAuthData();
      setAuthToken(authdata?.token || null);
    };

    fetchAuthData();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(async(token) => {
      console.log('Registered token:', token);
      if (authToken) {
         const data = { token };
         try {
           const response = await SaveTokenFunction(data, authToken);
           console.log('SaveTokenUrl response:', response.data);
         } catch (error) {
           console.error('SaveTokenUrl error:', error);
         }
       } else {
         console.log('No auth token available, skipping SaveTokenUrl call.');
       }
    });

    const { notificationListener: notifListener, responseListener: respListener } =
      setupNotificationListeners();

    notificationListener.current = notifListener;
    responseListener.current = respListener;

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [authToken]); // run this effect **after** authToken is loaded

  return (
    <RoleProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
         <SocketProvider>
          <GestureHandlerRootView>
            {children}
          </GestureHandlerRootView>
          </SocketProvider>
        </QueryClientProvider>
      </Provider>
    </RoleProvider>
  );
};

export default AppProvider;
