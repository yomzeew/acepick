import { Socket } from 'socket.io-client';
import { store } from '../redux/store';
import { addMessage, setMessages, setRoom } from '../redux/chatSlice';
import { setContacts } from '../redux/contactSlice';
import { getSocket as getGlobalSocket } from './socketInstance';

export const initializeSocketListeners = (socket?: Socket | null) => {
  const activeSocket = socket || getGlobalSocket();
  if (!activeSocket) {
    console.log('Socket not available yet, listeners will be set up when socket connects');
    return;
  }

  activeSocket.on('connected', () => {
    console.log('Socket connected');
  });

  activeSocket.on('receive_message', (data) => {
    const roomId = data.roomId;
    store.dispatch(addMessage({ roomId, message: data.message }));
  });

  activeSocket.on('receive_messages', (data) => {
    const roomId = data.roomId;
    store.dispatch(setMessages({ roomId, messages: data.messages }));
  });

  activeSocket.on('receive_file', (data) => {
    const roomId = data.roomId;
    store.dispatch(addMessage({ roomId, message: data.message }));
  });

  activeSocket.on('all_contacts', (contacts) => {
    store.dispatch(setContacts(contacts));
  });

  activeSocket.on('joined_room', ({ roomId }) => {
    store.dispatch(setRoom(roomId));
  });

  activeSocket.on('got_previous_chats', (data) => {
    const roomId = data.roomId;
    store.dispatch(setMessages({ roomId, messages: data.messages }));
  });
};

export const emitJoinRoom = (roomId: string, contactId: string) => {
  const socket = getGlobalSocket();
  socket?.emit('join_room', { room: roomId, contactId });
};

export const emitSendMessage = (roomId: string, message: any) => {
  const socket = getGlobalSocket();
  socket?.emit('send_message', { roomId, message });
};

export const emitGetContacts = () => {
  const socket = getGlobalSocket();
  socket?.emit('get_contacts');
};

export const emitGetMessages = (roomId: string) => {
  const socket = getGlobalSocket();
  socket?.emit('get_messages', { roomId });
};

export const emitPreviousChats = () => {
  const socket = getGlobalSocket();
  socket?.emit('previous_chats');
};

export const emitUploadFile = (data: any) => {
  const socket = getGlobalSocket();
  socket?.emit('upload_file', data);
};