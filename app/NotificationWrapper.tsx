import { ReactNode, useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import { Provider, useDispatch } from "react-redux";
import '../global.css';
import {store,persistor} from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { registerForPushNotificationsAsync, setupNotificationListeners } from "services/notificationServices";
import { SaveTokenFunction } from "services/userService";
import { useSecureAuth } from "hooks/useSecureAuth";

import { setFcmToken } from "redux/authSlice";


interface NotificationWrapperProps{
    children:ReactNode
}
const NotificationWrapper=({children}:NotificationWrapperProps)=>{
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const dispatch=useDispatch()

  useEffect(() => {
    registerForPushNotificationsAsync().then(async(token) => {
      console.log('Registered token:', token);
      if(token){
        dispatch(setFcmToken(token))
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
  }, []); // run this effect **after** authToken is loaded


    return(
        <>
         {children}
        </>
      
    )
}
export default NotificationWrapper