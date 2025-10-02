
import { config, logger } from '../config/environment';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const createSocket = (): Socket => {
  if (socket) {
    return socket;
  }

  try {
    socket = io(config.baseUrl, {
      path: config.socketPath,
      transports: ['websocket'],
      timeout: config.apiTimeout,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      logger.log('Socket connected successfully');
    });

    socket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      logger.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      logger.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      logger.error('Socket reconnection error:', error);
    });

    return socket;
  } catch (error) {
    logger.error('Failed to create socket:', error);
    throw error;
  }
};

export const getSocket = (): Socket => {
  return createSocket();
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket();