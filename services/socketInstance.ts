import { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;
export const setSocket = (newSocket: Socket | null): void => {
  socket = newSocket;
};
  