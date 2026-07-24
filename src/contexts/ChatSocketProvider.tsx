import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import socketService from '../services/socketService';

interface ChatSocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  socket: ReturnType<typeof socketService.getSocket>;
}

export const ChatSocketContext = createContext<ChatSocketContextType | undefined>(undefined);

interface ChatSocketProviderProps {
  children: ReactNode;
}

export function ChatSocketProvider({ children }: ChatSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Function to get token and connect
    const attemptConnection = () => {
      // Get token from localStorage - try multiple possible keys
      let token = localStorage.getItem('accessToken');
    
      // If not found, try other common token keys
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = localStorage.getItem('authToken');
      }
      
      // Debug: log all localStorage keys to help diagnose
    if (!token) {
        console.log('Available localStorage keys:', Object.keys(localStorage));
        console.log('No access token found, skipping socket connection');
      return;
    }
      
      console.log('Found access token, attempting socket connection...');

    // Connect to socket
    socketService
      .connect(token)
      .then(() => {
        setIsConnected(true);
        console.log('Socket connected successfully');
      })
      .catch((error) => {
        console.error('Failed to connect socket:', error);
        setIsConnected(false);
        // If it's an authentication error, log a helpful message
        if (error?.message?.includes('authentication')) {
          console.warn('Socket authentication failed. The server may need to be updated to accept employee tokens.');
        }
      });
    };

    // Try to connect immediately
    attemptConnection();

    // Also listen for storage changes in case token is set later
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && e.newValue) {
        console.log('Access token detected in storage, attempting connection...');
        attemptConnection();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically if token becomes available (for same-tab updates)
    const checkInterval = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      const currentlyConnected = socketService.isConnected();
      if (token && !currentlyConnected) {
        console.log('Token found on periodic check, attempting connection...');
        attemptConnection();
      }
    }, 2000);

    // Update connection status
    const socket = socketService.getSocket();
    const handleConnect = () => {
      // Don't set connected immediately - wait for authentication
      console.log('Socket connect event received');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: unknown) => {
      // If authentication error, mark as disconnected
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'UNAUTHORIZED') {
        console.warn('Socket authentication failed, marking as disconnected');
        setIsConnected(false);
      }
    };

    const handleAuthenticated = () => {
      console.log('Socket authenticated, marking as connected');
      setIsConnected(true);
    };

    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('error', handleError);
      socket.on('authenticated', handleAuthenticated);
      
      // Check if already connected - wait a bit to see if authentication succeeds
      if (socket.connected) {
        // Wait a bit to see if we get an authentication error
        setTimeout(() => {
          if (socket.connected) {
            // If still connected after timeout, assume authenticated
            setIsConnected(true);
          }
        }, 2000);
      }
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('error', handleError);
        socket.off('authenticated', handleAuthenticated);
      }
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const connect = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    await socketService.connect(token);
    setIsConnected(socketService.isConnected());
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  return (
    <ChatSocketContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        socket: socketService.getSocket(),
      }}>
      {children}
    </ChatSocketContext.Provider>
  );
}

