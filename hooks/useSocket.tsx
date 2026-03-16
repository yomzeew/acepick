import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { baseUrl } from 'utilizes/endpoints';
import { setSocket as setGlobalSocket } from '../services/socketInstance';
import { initializeSocketListeners } from '../services/socketHandler';

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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only create socket connection when token is available
    if (!token) {
      console.log('⏳ Waiting for auth token before connecting socket...');
      return;
    }

    // Limit connection attempts to prevent spam
    if (connectionAttempts >= 5) {
      console.log('🚫 Max connection attempts reached, pausing socket retries...');
      return;
    }

    const socketInstance: Socket = io(baseUrl, {
      path: '/chat',
      transports: ['websocket'],
      auth: { token }, // Pass token during connection
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server');
      setIsConnected(true);
      setConnectionAttempts(0); // Reset attempts on successful connection
      setLastError(null);
      // Initialize socket listeners after successful connection
      initializeSocketListeners(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      const errorMessage = err.message || 'Unknown connection error';
      
      // Only log new errors, not repeats
      if (lastError !== errorMessage) {
        console.log('⚠️ WebSocket connection error:', errorMessage);
        setLastError(errorMessage);
      }
      
      setConnectionAttempts(prev => prev + 1);
    });

    // Assign to local and global
    setSocket(socketInstance);
    setGlobalSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setGlobalSocket(null);
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, connectionAttempts]); // Re-run when token changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context; // return the whole context object: { socket, isConnected }
};