import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../redux/slices/chatSlice';

const CACHE_PREFIX = 'chat_msgs_';
const MAX_CACHED_MESSAGES = 200; // per room

/**
 * Lightweight on-device cache for chat messages.
 *
 * Strategy:
 *  1. When a room is opened, load cached messages instantly → show to user.
 *  2. Emit get_messages to server → receive full / incremental list.
 *  3. Merge server response into cache (server is source of truth).
 *  4. Every new outgoing/incoming message is appended to cache in real-time.
 */
const ChatCacheService = {
  /** Build storage key for a given room */
  _key(room: string): string {
    return `${CACHE_PREFIX}${room}`;
  },

  /** Load cached messages for a room. Returns [] if nothing cached. */
  async getMessages(room: string): Promise<ChatMessage[]> {
    try {
      const raw = await AsyncStorage.getItem(this._key(room));
      if (!raw) return [];
      const msgs: ChatMessage[] = JSON.parse(raw);
      return msgs;
    } catch (e) {
      console.warn('[ChatCache] read error:', e);
      return [];
    }
  },

  /** Replace the entire cache for a room (used after server sync). */
  async setMessages(room: string, messages: ChatMessage[]): Promise<void> {
    try {
      // Keep only the most recent N messages to avoid storage bloat
      const trimmed = messages.slice(-MAX_CACHED_MESSAGES);
      await AsyncStorage.setItem(this._key(room), JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[ChatCache] write error:', e);
    }
  },

  /** Append a single message to the cache (new incoming / outgoing). */
  async addMessage(room: string, message: ChatMessage): Promise<void> {
    try {
      const existing = await this.getMessages(room);
      existing.push(message);
      // Trim if over limit
      const trimmed = existing.slice(-MAX_CACHED_MESSAGES);
      await AsyncStorage.setItem(this._key(room), JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[ChatCache] append error:', e);
    }
  },

  /** Clear cache for a specific room. */
  async clearRoom(room: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this._key(room));
    } catch (e) {
      console.warn('[ChatCache] clearRoom error:', e);
    }
  },

  /** Clear all chat caches (e.g. on logout). */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      if (chatKeys.length > 0) {
        await AsyncStorage.multiRemove(chatKeys);
      }
    } catch (e) {
      console.warn('[ChatCache] clearAll error:', e);
    }
  },

  /** Get the timestamp of the most recent cached message for a room. */
  async getLastTimestamp(room: string): Promise<string | null> {
    const msgs = await this.getMessages(room);
    if (msgs.length === 0) return null;
    // Walk backwards to find the latest timestamp
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].timestamp) return msgs[i].timestamp!;
    }
    return null;
  },
};

export default ChatCacheService;
