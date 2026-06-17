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
      id?: number;
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
  refreshTrigger: number;          // timestamp to trigger contact list refresh
  isLoading: boolean;
  isCacheLoaded: boolean;         // true once cached messages have been loaded
  isSynced: boolean;              // true once server messages have replaced cache
  error: string | null;
}

// ── Initial state ─────────────────────────────────────────────────────

const initialState: ChatState = {
  roomId: null,
  messages: [],
  contacts: [],
  previousChats: [],
  refreshTrigger: 0,
  isLoading: false,
  isCacheLoaded: false,
  isSynced: false,
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
      state.isCacheLoaded = false;
      state.isSynced = false;
    },
    clearRoom: (state) => {
      state.roomId = null;
      state.messages = [];
      state.isCacheLoaded = false;
      state.isSynced = false;
    },
    loadCachedMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      // Only load cache if server hasn't synced yet
      if (!state.isSynced && action.payload.length > 0) {
        state.messages = action.payload;
      }
      state.isCacheLoaded = true;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
      state.isSynced = true;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      const isDuplicate = state.messages.some(
        (m) => m.from === msg.from && m.text === msg.text && m.timestamp === msg.timestamp
      );
      if (!isDuplicate) {
        state.messages.push(msg);
      }
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
    setRefreshTrigger: (state, action: PayloadAction<number>) => {
      state.refreshTrigger = action.payload;
    },
  },
});

export const {
  setRoom,
  clearRoom,
  loadCachedMessages,
  setMessages,
  addMessage,
  setContacts,
  setPreviousChats,
  setLoading,
  setError,
  resetChat,
  setRefreshTrigger,
} = chatSlice.actions;

export default chatSlice.reducer;
