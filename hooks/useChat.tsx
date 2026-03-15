// src/hooks/useChat.ts
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getSocket } from '../services/socket';

export const useChat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) =>state.auth);
  const { roomId } = useSelector((state: RootState) => state.chat);
  const [partner, setPartner] = React.useState<any>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();
    if (user?.id && socket) {
      socket.emit('connectUser', user.id);
    }

    return () => {
      if (socket) {
        socket.emit('disconnectUser');
      }
    };
  }, [user?.id]);

  // Join room when it changes
  useEffect(() => {
    const socket = getSocket();
    if (roomId && socket) {
      socket.emit('joinRoom', roomId);
      socket.emit('getMessages', roomId);
    }
  }, [roomId]);

  const sendMessage = (text: string, partnerId?: string) => {
    if (!roomId || !user?.id) return;
    const socket = getSocket();

    const messageData = {
      text,
      to: partnerId || partner?.id,
      from: user.id,
      room: roomId,
      time: new Date().toISOString(),
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
    }
  };

  const sendFile = (fileData: any, partnerId?: string) => {
    if (!roomId || !user?.id) return;
    const socket = getSocket();

    const completeFileData = {
      ...fileData,
      to: partnerId || partner?.id,
      from: user.id,
      room: roomId,
      time: new Date().toISOString(),
    };

    if (socket) {
      socket.emit('uploadFile', completeFileData);
    }
  };

  return {
    sendMessage,
    sendFile,
    setPartner,
    roomId,
  };
};