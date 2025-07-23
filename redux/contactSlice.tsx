import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
}

const contactSlice = createSlice({
  name: "contacts",
  initialState: {
    list: [] as Contact[],
  },
  reducers: {
    setContacts(state, action: PayloadAction<Contact[]>) {
      state.list = action.payload;
    },
  },
});

export const { setContacts } = contactSlice.actions;
export default contactSlice.reducer;