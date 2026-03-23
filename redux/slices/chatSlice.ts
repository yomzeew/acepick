import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types matching backend Prisma models ──────────────────────────────

// Backend: Message { id, from, text, isDeleted, timestamp, chatroomId }
export interface ChatMessage {
  to: string;
  from: string;
  text: string;
  room: string;
  timestamp?: string;
  image?: string;
  fileName?: string;
}

// Backend: ChatRoom { id, name, members (comma-separated) }
export interface ChatRoom {
  id: number;
  name: string;
  members: string;
  createdAt?: string;
  updatedAt?: string;
}

// Backend: User with profile, location, onlineUser (returned from previous_chats / get_contacts)
export interface ChatContact {
  id: string;
  email: string;
  phone: string;
  role: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    professional?: {
      profession?: {
        name?: string;
      };
    };
  };
  location?: any;
  onlineUser?: {
    isOnline: boolean;
    lastActive: string;
    socketId: string;
  };
}

export interface ChatState {
  roomId: string | null;          // current room name (the random string)
  messages: ChatMessage[];        // messages for current room
  contacts: ChatContact[];        // all contacts
  previousChats: ChatContact[];   // users with existing conversations
  isLoading: boolean;
  error: string | null;
}

// ── Initial state ─────────────────────────────────────────────────────

const initialState: ChatState = {
  roomId: null,
  messages: [],
  contacts: [],
  previousChats: [],
  isLoading: false,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
      state.messages = [];
    },
    clearRoom: (state) => {
      state.roomId = null;
      state.messages = [];
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setContacts: (state, action: PayloadAction<ChatContact[]>) => {
      state.contacts = action.payload;
    },
    setPreviousChats: (state, action: PayloadAction<ChatContact[]>) => {
      state.previousChats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetChat: () => initialState,
  },
});

export const {
  setRoom,
  clearRoom,
  setMessages,
  addMessage,
  setContacts,
  setPreviousChats,
  setLoading,
  setError,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
