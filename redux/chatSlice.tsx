import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContactUser } from 'types/listofContactType';
import { PreviousChatData, UserData } from 'types/type';


// Chat message type
export interface ChatMessage {
  from: string;
  to: string;
  text?: string;
  image?: any;
  time?: any;
  fromSelf?: boolean;
  fileName?: any;
  timestamp?: any;
  id?: string; // userId
  media?: string[];
  room?:string
}

// Redux state shape for chat
interface ChatState {
  messages: {
    [roomId: string]: ChatMessage[];
  };
  roomId: string;
  previousChats: ContactUser[]; // ✅ Added
}

// Initial state
const initialState: ChatState = {
  messages: {},
  roomId: '',
  previousChats: [], // ✅ Added
};

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) {
      state.messages[action.payload.roomId] = action.payload.messages;
    },
    addMessage(state, action: PayloadAction<{ roomId: string; message: ChatMessage }>) {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) state.messages[roomId] = [];
      state.messages[roomId].push(message);
    },
    setRoom(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
    // ✅ New reducers for previous chats
    addPreviousChat(state, action: PayloadAction<ContactUser>) {
      state.previousChats.push(action.payload);
    },
    setPreviousChats(state, action: PayloadAction<ContactUser[]>) {
      state.previousChats = action.payload;
    },
  },
});

// Exports
export const {
  setMessages,
  addMessage,
  setRoom,
  addPreviousChat,
  setPreviousChats,
} = chatSlice.actions;

export default chatSlice.reducer;
