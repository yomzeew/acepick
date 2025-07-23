// redux/selectors/chatSelectors.ts
import { createSelector } from 'reselect';
import { RootState } from 'redux/store';

export const selectChatMessages = (roomId: string | null) =>
  createSelector(
    (state: RootState) => state.chat.messages,
    (messages) => {
      if (!roomId) return [];
      return messages[roomId] || [];
    }
  );
  export const selectAllMessages = (state: RootState) => state.chat?.messages;

  export const makeSelectChatMessagesByUserId = (userId: string) =>
    createSelector([selectAllMessages], (messages) => messages[userId] || []);
