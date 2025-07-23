import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { baseUrl } from 'utilizes/endpoints';
import { setSocket as setGlobalSocket } from '../services/socketInstance';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const socketInstance: Socket = io(baseUrl, {
      path: '/chat', // or your preferred path
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.log('⚠️ Connection error:', err.message);
    });

    // Assign to local and global
    setSocket(socketInstance);
    setGlobalSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setGlobalSocket(null);
    };
  }, []);

  // Auth + connect once token is ready
  useEffect(() => {
    if (socket && token) {
      socket.auth = { token };
      socket.connect();
    }
  }, [token, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
