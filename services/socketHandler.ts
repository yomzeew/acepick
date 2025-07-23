import socket from './socket';
import { store } from '../redux/store';
import { addMessage, setMessages, setRoom } from '../redux/chatSlice';
import { setContacts } from '../redux/contactSlice';

export const initializeSocketListeners = () => {
  socket.on('connected', () => {
    console.log('Socket connected');
  });

  socket.on('receive_message', (data) => {
    const roomId = data.roomId;
    store.dispatch(addMessage({ roomId, message: data.message }));
  });

  socket.on('receive_messages', (data) => {
    const roomId = data.roomId;
    store.dispatch(setMessages({ roomId, messages: data.messages }));
  });

  socket.on('receive_file', (data) => {
    const roomId = data.roomId;
    store.dispatch(addMessage({ roomId, message: data.message }));
  });

  socket.on('all_contacts', (contacts) => {
    store.dispatch(setContacts(contacts));
  });

  socket.on('joined_room', ({ roomId }) => {
    store.dispatch(setRoom(roomId));
  });

  socket.on('got_previous_chats', (data) => {
    const roomId = data.roomId;
    store.dispatch(setMessages({ roomId, messages: data.messages }));
  });
};

export const emitJoinRoom = (roomId: string, contactId: string) => {
  socket.emit('join_room', { room: roomId, contactId });
};

export const emitSendMessage = (roomId: string, message: any) => {
  socket.emit('send_message', { roomId, message });
};

export const emitGetContacts = () => {
  socket.emit('get_contacts');
};

export const emitGetMessages = (roomId: string) => {
  socket.emit('get_messages', { roomId });
};

export const emitPreviousChats = () => {
  socket.emit('previous_chats');
};

export const emitUploadFile = (data: any) => {
  socket.emit('upload_file', data);
};