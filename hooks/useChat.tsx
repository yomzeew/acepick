// src/hooks/useChat.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { socketService } from '../services/socket.service';

export const useChat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) =>state.auth);
  const { room, partner } = useSelector((state: RootState) => state.chat);

  // Initialize socket connection
  useEffect(() => {
    if (user?.id) {
      socketService.connectUser(user.id);
      socketService.getContacts(user.id);
      socketService.getPreviousChats(user.id);
    }

    return () => {
      socketService.disconnectUser();
    };
  }, [user?.id]);

  // Join room when it changes
  useEffect(() => {
    if (room) {
      socketService.joinRoom(room);
      socketService.getMessages(room);
    }
  }, [room]);

  const sendMessage = (text: string) => {
    if (!room || !user?.id || !partner?.id) return;

    const messageData = {
      text,
      to: partner.id,
      from: user.id,
      room,
      time: new Date().toISOString(),
    };

    socketService.sendMessage(messageData);
  };

  const sendFile = (fileData: any) => {
    if (!room || !user?.id || !partner?.id) return;

    const completeFileData = {
      ...fileData,
      to: partner.id,
      from: user.id,
      room,
      time: new Date().toISOString(),
    };

    socketService.uploadFile(completeFileData);
  };

  return {
    sendMessage,
    sendFile,
  };
};