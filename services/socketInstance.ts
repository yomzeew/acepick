import { Socket } from 'socket.io-client';
import DeviceIdService from './deviceIdService';

let socket: Socket | null = null;
let currentDeviceId: string | null = null;

export const getSocket = (): Socket | null => socket;
export const getDeviceId = (): string | null => currentDeviceId;

export const setSocket = (newSocket: Socket | null): void => {
  socket = newSocket;
};

/**
 * Connect socket with device ID authentication
 */
export const connectSocketWithDeviceId = async (userId: string): Promise<Socket | null> => {
  try {
    // Get device ID
    const deviceId = await DeviceIdService.getDeviceId();
    currentDeviceId = deviceId;

    // Import socket.io-client dynamically to avoid issues
    const { io } = require('socket.io-client');

    // Import Redux store to get auth token
    const { store } = require('../redux/store');
    const state = store.getState();
    const token = state.auth.token;

    if (!token) {
      console.error('No authentication token found - cannot connect socket');
      throw new Error('Authentication token required for socket connection');
    }

    // Use same base URL as API but remove /api suffix for socket connection
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    
    // Connect with both token and device ID in auth
    socket = io(socketUrl, {
      path: '/chat',
      auth: {
        token,
        userId,
        deviceId,
      },
      transports: ['websocket'],
    });

    console.log('🔌 Socket connected with device ID:', deviceId);
    return socket;
  } catch (error) {
    console.error('❌ Error connecting socket with device ID:', error);
    throw error;
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    console.log('📱 Device ID:', currentDeviceId);
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentDeviceId = null;
  }
};

export const cleanupSocket = (): void => {
  if (socket) {
    console.log('🧹 Cleaning up socket listeners...');
    socket.removeAllListeners();
  }
};
  